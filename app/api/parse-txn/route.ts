import { NextResponse } from "next/server";

// Dynamic model cache to avoid hitting ListModels API on every request
let modelCache: string[] = [];
let lastSync = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function getBestModels(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (modelCache.length > 0 && (now - lastSync) < CACHE_TTL) {
    return modelCache;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (!data.models) return ["gemini-1.5-flash"];

    const discovered = data.models
      .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
      .map((m: any) => m.name.replace("models/", ""));
    
    if (discovered.length === 0) return ["gemini-1.5-flash"]; // Absolute last resort

    // Dynamically identify our preferred models if they exist in the discovered list
    const preferred = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-latest"];
    const priority = preferred.filter(p => discovered.includes(p));
    const others = discovered.filter(d => !priority.includes(d));

    // Shuffle others to distribute load
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
    const { input } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const modelsToTry = await getBestModels(apiKey);
    console.log("Dynamic AI: Testing models for transaction parsing", modelsToTry);

    const responseSchema = {
      type: "object",
      properties: {
        amount: { type: "integer" },
        type: { type: "string", enum: ["income", "expense"] },
        category: { type: "string" },
        description: { type: "string" },
        confidence: { type: "number" }
      },
      required: ["amount", "type", "category", "description", "confidence"]
    };

    const requestBody = {
      contents: [{
        parts: [{ text: `Extract financial transaction from text. Language: Indonesian or English. Text: "${input}"` }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
        response_mime_type: "application/json",
        response_schema: responseSchema 
      }
    };

    let lastError = "";
    let successfulData = null;
    let usedModel = "";

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
          successfulData = data;
          usedModel = modelId;
          break; 
        } else {
          lastError = data.error?.message || "Generation error";
          console.error(`Dynamic AI: Model ${modelId} failed. Reason: ${lastError}`);
          continue;
        }
      } catch (err: any) {
        lastError = err.message;
        continue;
      }
    }

    if (!successfulData) {
        return NextResponse.json({ error: "AI Architecture Failure", details: lastError }, { status: 500 });
    }

    const text = successfulData.candidates[0].content.parts[0].text || "";
    console.log(`Dynamic AI: Success using ${usedModel}`);

    try {
      return NextResponse.json(JSON.parse(text.trim()));
    } catch (e: any) {
      // Final brace extraction fallback
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return NextResponse.json(JSON.parse(match[0]));
      
      return NextResponse.json({ error: "AI Output Malformed", raw: text }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: "System Error", details: error.message }, { status: 500 });
  }
}
