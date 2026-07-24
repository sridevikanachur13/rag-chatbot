import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getVectorStore } from "@/lib/vectorStore";

export async function POST(request) {
  try {
    const { question } = await request.json();

    const vectorStore = getVectorStore();
    if (!vectorStore) {
      return Response.json(
        { error: "No document indexed yet. Please index some text first." },
        { status: 400 },
      );
    }

    // Retrieval - same concept as Day 17's collection.query()
    const retriever = vectorStore.asRetriever({ k: 3 });
    const retrievedDocs = await retriever.invoke(question);

    const context = retrievedDocs.map((doc) => doc.pageContent).join("\n\n");

    const prompt = `Answer the question using ONLY the context below. If the answer isn't in the context, say "I don't have enough information to answer that."

Context:
${context}

Question: ${question}

Answer:`;

    const llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      model: "gemini-2.5-flash",
    });

    const response = await llm.invoke(prompt);

    return Response.json({
      answer: response.content,
      sourcesUsed: retrievedDocs.length,
    });
  } catch (err) {
    console.error("RAG chat error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
