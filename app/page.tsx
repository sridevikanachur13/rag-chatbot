"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  async function handleIngest() {
    if (!file) {
      setStatus("Please select a PDF file first.");
      return;
    }

    setStatus("Uploading and indexing...");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/ingest", {
      method: "POST",
      body: formData, // no Content-Type header needed - browser sets it automatically for FormData
    });
    const data = await res.json();
    setStatus(
      data.error
        ? `Error: ${data.error}`
        : `Indexed "${data.fileName}" - ${data.chunksIndexed} chunks from ${data.extractedLength} characters`,
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
      <h1 className="text-2xl font-bold mb-4">Chat With Your PDF</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e?.target?.files?.[0])}
        className="mb-2"
      />
      <button
        onClick={handleIngest}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg block mb-2"
      >
        Upload & Index PDF
      </button>
      <p className="mb-6 text-gray-600">{status}</p>

      <input
        className="w-full border rounded-lg p-3 text-black mb-2"
        placeholder="Ask a question about the PDF..."
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
