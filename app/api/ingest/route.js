import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { setVectorStore } from "@/lib/vectorStore";

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const docs = await splitter.createDocuments([text]);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      model: "gemini-embedding-001",
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    setVectorStore(vectorStore);

    return Response.json({ success: true, chunksIndexed: docs.length });
  } catch (err) {
    console.error("Ingest error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
