import { setVectorStore } from "@/lib/vectorStore";

export async function POST() {
  setVectorStore(null);
  return Response.json({ success: true });
}
