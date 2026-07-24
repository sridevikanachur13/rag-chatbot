"use client";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  async function handleIngest() {
    setStatus("Indexing...");
    const res = await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (data.error) {
      setStatus(`Error: ${data.error}`);
    } else {
      setStatus(`Indexed ${data.chunksIndexed} chunks successfully!`);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">RAG Document Indexer (Test)</h1>
      <textarea
        className="w-full h-64 border rounded-lg p-3 text-black mb-4"
        placeholder="Paste some document text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleIngest}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Index This Text
      </button>
      <p className="mt-4 text-gray-600">{status}</p>
    </main>
  );
}
