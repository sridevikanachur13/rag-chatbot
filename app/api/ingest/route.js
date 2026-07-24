import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { getVectorStore, setVectorStore } from "@/lib/vectorStore";
import pdf from "pdf-parse/lib/pdf-parse.js";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfData = await pdf(buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return Response.json(
        { error: "Could not extract text from this PDF" },
        { status: 400 },
      );
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });

    // Tag each chunk with metadata about which file it came from
    const docs = await splitter.createDocuments(
      [extractedText],
      [{ source: file.name }], // metadata attached to every resulting chunk
    );

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      model: "gemini-embedding-001",
    });

    let vectorStore = getVectorStore();

    if (!vectorStore) {
      // First document ever indexed - create the store
      vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
      setVectorStore(vectorStore);
    } else {
      // Subsequent documents - ADD to the existing store instead of replacing it
      await vectorStore.addDocuments(docs);
    }

    return Response.json({
      success: true,
      chunksIndexed: docs.length,
      fileName: file.name,
      extractedLength: extractedText.length,
    });
  } catch (err) {
    console.error("Ingest error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
