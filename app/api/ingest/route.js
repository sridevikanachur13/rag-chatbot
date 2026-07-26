import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getSupabaseVectorStore } from "@/lib/vectorStore";
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

    const docs = await splitter.createDocuments(
      [extractedText],
      [{ source: file.name }],
    );

    const vectorStore = getSupabaseVectorStore();
    await vectorStore.addDocuments(docs);

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
