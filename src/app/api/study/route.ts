import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Text too short. Please provide more material." }), { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: `You are NaiaBot, her personal AI study assistant. 
Your job is to read the provided study material and generate exactly 5-8 flashcards from it to test her knowledge.
You must return the result strictly as a valid JSON array of objects. Do not use markdown blocks like \`\`\`json. Just the raw array.
Format:
[
  { "question": "Question here", "answer": "Answer here" }
]
Keep questions concise and answers accurate but easy to memorize.`,
    });

    const response = await model.generateContent(text);
    let output = response.response.text().trim();
    
    // Strip markdown formatting if the model disobeys
    if (output.startsWith("```json")) {
        output = output.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    }
    
    const flashcards = JSON.parse(output);

    return new Response(JSON.stringify({ flashcards }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Flashcard generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate flashcards." }), { status: 500 });
  }
}
