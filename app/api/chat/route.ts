import { NextResponse } from "next/server";

let modelCache: string[] = [];
let lastSync = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function getBestModels(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (modelCache.length > 0 && (now - lastSync) < CACHE_TTL) return modelCache;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (!data.models) return ["gemini-1.5-flash"];

    const discovered = data.models
      .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
      .map((m: any) => m.name.replace("models/", ""));
    
    if (discovered.length === 0) return ["gemini-1.5-flash"];

    const preferred = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-8b"];
    const priority = preferred.filter((p: string) => discovered.includes(p));
    const others = discovered.filter((d: string) => !priority.includes(d));
    const shuffledOthers = others.sort(() => Math.random() - 0.5);

    modelCache = [...priority, ...shuffledOthers].slice(0, 15); 
    lastSync = now;
    return modelCache;
  } catch (e) {
    return ["gemini-1.5-flash"];
  }
}

// Simple in-memory rate limiter for production stability
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 15;

export async function POST(req: Request) {
  // --- RATE LIMITING ---
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const userData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - userData.lastReset > RATE_LIMIT_WINDOW) {
      userData.count = 0;
      userData.lastReset = now;
  }

  userData.count++;
  rateLimitMap.set(ip, userData);

  if (userData.count > MAX_REQUESTS) {
      return NextResponse.json({ 
          content: "Kecepatan akses terlalu tinggi. Mohon tunggu sebentar sebelum mengirim pesan lagi.",
          error: "Rate limit exceeded" 
      }, { status: 429 });
  }

  try {
    const { messages, financialContext } = await req.json();

    // --- PAYLOAD VALIDATION ---
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;
    if (lastMessage.length > 5000) {
        return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const modelsToTry = await getBestModels(apiKey);
    
    // Construct System Instruction based on financial data
    const systemInstruction = `Anda adalah "Your Command", Partner Finansial Eksekutif (Personal Assistant) untuk Mr. Warren Buffet.
    Tugas Anda adalah mengelola keuangan Mr. Buffet dengan presisi tinggi dan komunikasi yang elegan.
    
    KONTEKS DATA SAAT INI:
    ${financialContext}

    PROTOKOL KOMUNIKASI "BUFFET PRECISION" (WAJIB):
    1. IDENTITAS: Anda melayani Mr. Warren Buffet. Panggil dengan sapaan "Mr. Buffet" atau "Sir".
    2. LARANGAN "AUTO-SAVE": DILARANG KERAS menyertakan blok [[ACTION:...]] pada respon pertama jika input user masih ambigu atau kurang detail (misal: "dapat bonus 500rb" atau "makan 50rb").
    3. TAHAP KLARIFIKASI: Jika user memberikan input transaksi yang belum lengkap, Anda WAJIB bertanya:
       - "Apa keperluan spesifiknya (Deskripsi)?"
       - "Untuk tanggal berapa transaksi ini dicatat?"
    4. TAHAP KONFIRMASI: Setelah data lengkap, Anda harus merangkumnya dan bertanya: "Boleh saya catat sekarang, Sir?"
    5. EKSEKUSI ACTION: Anda HANYA boleh menyertakan blok [[ACTION:...]] jika Mr. Buffet sudah memberikan konfirmasi (seperti "Ok", "Ya", "Gas", "Catat", dll).

    ATURAN FORMAT ACTION:
    [[ACTION:{"type":"ADD_TRANSACTION", "payload":{"amount":NUMBER, "type":"income/expense", "category":"STRING", "description":"STRING", "createdAt":"ISO_STRING"}}]]
    *Amount: Angka murni (Integer). Kategori: Gaji, Makanan & Minuman, Transportasi, Belanja, Tagihan, Freelance, Investasi, Hiburan, Lainnya.*

    CONTOH INTERAKSI ELIT:
    User: "Dapat 500rb"
    AI: "Siapp Mr. Buffet, ada pemasukan 500rb. Kalau boleh tahu, ini dari mana ya, Sir? Dan mau dicatat untuk tanggal hari ini atau tanggal lain?"
    User: "Dividen saham Apple, catat hari ini"
    AI: "Baik Sir, saya rangkum: Pemasukan 500rb dari Dividen Saham Apple untuk hari ini (14 April 2026). Boleh saya catat sekarang di sistem?"
    User: "Ok"
    AI: "Siapp, sudah saya amankan di sistem, Sir! [[ACTION:{"type":"ADD_TRANSACTION", "payload":{"amount":500000, "type":"income", "category":"Investasi", "description":"Dividen Saham Apple", "createdAt":"2026-04-14T12:00:00Z"}}]]"`;

    // Flatten history for Gemini format (contents: [{role, parts: [{text}]}])
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Insert system prompt as the beginning of the context
    const fullContents = [
        { role: 'user', parts: [{ text: `KONTEKS SISTEM: ${systemInstruction}. Mohon hadir sebagai "Your Command".` }] },
        { role: 'model', parts: [{ text: "Halo Dyko! Saya asisten SmartFinance Anda. Mau catat pemasukan/pengeluaran baru atau mau tanya soal budget bulan ini?" }] },
        ...contents
    ];

    const requestBody = {
      contents: fullContents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      }
    };

    let lastError = "";
    for (const modelId of modelsToTry) {
      try {
        const URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
        const response = await fetch(URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        
        if (response.ok && data.candidates?.[0]?.content) {
            const replyText = data.candidates[0].content.parts[0].text;
            return NextResponse.json({ content: replyText });
        } else {
            lastError = data.error?.message || "Generation error";
            continue;
        }
      } catch (err: any) {
        lastError = err.message;
        continue;
      }
    }

    return NextResponse.json({ error: "Chat Engine Failure", details: lastError }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: "Network Error", details: error.message }, { status: 500 });
  }
}
