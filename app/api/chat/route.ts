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
    const priority = preferred.filter(p => discovered.includes(p));
    const others = discovered.filter(d => !priority.includes(d));
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
    const systemInstruction = `Anda adalah "Your Command", Partner Finansial Eksekutif yang cerdas dan solutif.
    Tugas Anda adalah mengelola keuangan Dyko. Anda harus luwes dalam mengobrol, tapi SANGAT TEGAS dalam menjalankan perintah database.

    KONTEKS DATA SAAT INI:
    ${financialContext}

    ATURAN EMAS (WAJIB):
    1. GAYA BAHASA: Sopan, cerdas, luwes (Natural Indonesian). Akui input user dengan antusias (e.g., "Siap, saya catat ya!").
    2. PROTOKOL ACTION: Setiap kali Dyko mengonfirmasi transaksi (bilang "ok", "ya", "betul", dll), Anda **WAJIB** menyertakan blok [[ACTION:...]] di akhir pesan Anda. TANPA KODE INI, TRANSAKSI TIDAK AKAN TERCATAT.
    3. FORMAT ACTION:
       [[ACTION:{"type":"ADD_TRANSACTION", "payload":{"amount":NUMBER, "type":"income/expense", "category":"STRING", "description":"STRING", "createdAt":"ISO_STRING"}}]]
       *PENTING: Khusus untuk 'amount', gunakan angka MENTAH (Integer). DILARANG KERAS menggunakan titik (.) atau koma (,) sebagai pemisah ribuan.*
    4. TANGGAL: Jika Dyko menyebutkan tanggal spesifik (e.g., "5 April"), Anda WAJIB menghitung ISO String untuk tanggal tersebut (e.g., "2026-04-05T12:00:00Z"). Jika tidak ada, gunakan hari ini (2026-04-14).
    5. KATEGORI: Gunakan salah satu dari: Gaji, Makanan & Minuman, Transportasi, Belanja, Tagihan, Freelance, Investasi, Hiburan, Lainnya.

    Contoh interaksi sukses:
    User: "ok" (setelah nego transaksi)
    AI: "Siaapp, sudah saya catat pengeluaran 350rb untuk makanan di tanggal 5 April 2026 ya, Dyko! Saldo Anda sekarang terupdate. [[ACTION:{"type":"ADD_TRANSACTION", "payload":{"amount":350000, "type":"expense", "category":"Makanan & Minuman", "description":"Makan", "createdAt":"2026-04-05T12:00:00Z"}}]]"`;

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
