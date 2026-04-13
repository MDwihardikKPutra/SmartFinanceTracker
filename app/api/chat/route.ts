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

export async function POST(req: Request) {
  try {
    const { messages, financialContext } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const modelsToTry = await getBestModels(apiKey);
    
    // Construct System Instruction based on financial data
    const systemInstruction = `Anda adalah "SmartFinance GPT", asisten keuangan pribadi yang sangat cerdas, detail, dan solutif.
    Tugas Anda adalah membantu pengguna mengelola keuangan berdasarkan data riwayat transaksi mereka. 
    Aura Anda: Profesional, bersahabat, jujur, dan analitis.

    DATA KEUANGAN PENGGUNA SAAT INI:
    ${financialContext}

    ATURAN:
    1. Jawablah berdasarkan data keuangan yang diberikan jika pengguna bertanya tentang saldo atau riwayat.
    2. Jika pengguna bertanya hal yang tidak ada di data, berikan saran keuangan umum yang bijak.
    3. Gunakan Bahasa Indonesia yang santai namun sopan (seperti seorang coach).
    4. Selalu berikan motivasi atau tips penghematan jika melihat pengeluaran membengkak.
    5. Jangan pernah memberikan saran investasi berisiko tinggi tanpa peringatan.
    6. Jawablah secara ringkas tapi informatif (paragraf pendek).`;

    // Flatten history for Gemini format (contents: [{role, parts: [{text}]}])
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Insert system prompt as the beginning of the context
    const fullContents = [
        { role: 'user', parts: [{ text: `KONTEKS SISTEM: ${systemInstruction}. Mohon dijawab sebagai SmartFinance GPT.` }] },
        { role: 'model', parts: [{ text: "Siap! Saya adalah SmartFinance GPT. Saya sudah mempelajari data keuangan Anda. Ada yang bisa saya bantu hari ini?" }] },
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
