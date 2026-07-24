import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

// This holds our vector store in server memory - resets on server restart
// (temporary approach for today, we'll persist it properly soon)
let globalVectorStore = null;

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    // Step 1: Chunk the text (same concept as your Python RecursiveCharacterTextSplitter)
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const docs = await splitter.createDocuments([text]);

    // Step 2: Set up embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      model: "gemini-embedding-001",
    });

    // Step 3: Embed + store all chunks in one call (same as Chroma.from_documents in Python)
    globalVectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

    return Response.json({
      success: true,
      chunksIndexed: docs.length,
    });
  } catch (err) {
    console.error("Ingest error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export function getVectorStore() {
  return globalVectorStore;
}
