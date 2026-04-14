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

    // Dynamically identify our preferred models if they exist in the discovered list
    const preferred = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-latest"];
    const priority = preferred.filter((p: string) => discovered.includes(p));
    const others = discovered.filter((d: string) => !priority.includes(d));

    // Shuffle others to rotate traffic and avoid hitting RPM limits
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
    const { history } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const modelsToTry = await getBestModels(apiKey);
    
    // Prepare transaction context for AI
    const context = history.slice(0, 15).map((t: any) => 
        `- ${new Date(t.createdAt).toLocaleDateString('id-ID')}: ${t.type === 'income' ? 'Masuk' : 'Keluar'} Rp ${t.amount.toLocaleString('id-ID')} (${t.category}: ${t.description || 'Tanpa deskripsi'})`
    ).join("\n");

    const prompt = `Bertindaklah sebagai "Money Coach" atau asisten keuangan pribadi yang cerdas dan suportif. 
    Analisis riwayat keuangan ini dan berikan SATU saran atau motivasi finansial yang sangat singkat, tajam, dan bersahabat dalam Bahasa Indonesia. 
    Gunakan gaya bahasa seorang mentor, bukan robot.
    Maksimal 15 kata. 
    FORMAT RESPON HARUS JSON: {"insight": "isi saran di sini"}

    Data Riwayat:
    ${context}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7, // Higher for more creative/unique insights
        maxOutputTokens: 256,
        response_mime_type: "application/json"
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
            const text = data.candidates[0].content.parts[0].text;
            return NextResponse.json(JSON.parse(text.trim()));
        } else {
            lastError = data.error?.message || "Generation error";
            continue;
        }
      } catch (err: any) {
        lastError = err.message;
        continue;
      }
    }

    return NextResponse.json({ error: "AI Insight Engine Failure", details: lastError });
  } catch (error: any) {
    return NextResponse.json({ error: "System Error", details: error.message });
  }
}
