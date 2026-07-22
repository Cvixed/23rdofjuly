import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { AI_SYSTEM_PROMPT } from "@/lib/constants";

export const maxDuration = 30;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const MODELS = ["gemini-flash-latest"];

async function tryGenerateWithFallback(formattedMessages: any[], mood: string = "Neutral", modelIndex = 0): Promise<any> {
  const modelName = MODELS[modelIndex];
  try {
    const dynamicPrompt = `${AI_SYSTEM_PROMPT}\n\n[CRITICAL CONTEXT: Naia's current mood is "${mood}". Please adapt your tone, empathy, and responses accordingly to support her current mood.]`;
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: dynamicPrompt,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const responseStream = await model.generateContentStream({
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 2048,
      }
    });

    return responseStream;
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("exhausted")) {
      if (modelIndex < MODELS.length - 1) {
        console.log(`Model ${modelName} rate limited, trying ${MODELS[modelIndex + 1]}...`);
        return tryGenerateWithFallback(formattedMessages, mood, modelIndex + 1);
      }
    }
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { messages, mood } = await req.json();

    const formattedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const responseStream = await tryGenerateWithFallback(formattedMessages, mood || "Neutral");

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            new TextEncoder().encode(
              "\n\n(Oops, connection lost!)"
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("exhausted")) {
      return new Response(
        "I'm a little overwhelmed right now, bnuy! 🐰 Give me a moment and try again in about 30 seconds. 💗",
        { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } } 
      );
    }
    return new Response(
      "Oops, something went wrong on my end! But hey, just know that you're amazing and so loved, bnuy! 💗 Try again in a moment?",
      { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
