"use client";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  async function handleIngest() {
    setStatus("Indexing...");
    const res = await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setStatus(
      data.error
        ? `Error: ${data.error}`
        : `Indexed ${data.chunksIndexed} chunks successfully!`,
    );
  }

  async function handleAsk() {
    setAnswer("Thinking...");
    const res = await fetch("/api/rag-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAnswer(data.error ? `Error: ${data.error}` : data.answer);
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">RAG Document Q&A (Test)</h1>

      <textarea
        className="w-full h-48 border rounded-lg p-3 text-black mb-2"
        placeholder="Paste some document text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleIngest}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-2"
      >
        Index This Text
      </button>
      <p className="mb-6 text-gray-600">{status}</p>

      <input
        className="w-full border rounded-lg p-3 text-black mb-2"
        placeholder="Ask a question about the text above..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button
        onClick={handleAsk}
        className="bg-green-600 text-white px-4 py-2 rounded-lg mb-2"
      >
        Ask
      </button>
      <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
    </main>
  );
}
