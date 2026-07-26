"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

  async function handleIngest() {
    if (!file) {
      setStatus("Please select a PDF file first.");
      return;
    }
    setStatus("Uploading and indexing...");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/ingest", { method: "POST", body: formData });
    const data = await res.json();
    setStatus(
      data.error
        ? `Error: ${data.error}`
        : `Indexed "${data.fileName}" - ${data.chunksIndexed} chunks from ${data.extractedLength} characters`,
    );
  }

  async function handleAsk() {
    setAnswer("Thinking...");
    setSources([]);
    const res = await fetch("/api/rag-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (data.error) {
      setAnswer(`Error: ${data.error}`);
    } else {
      setAnswer(data.answer);
      setSources(data.sources || []);
    }
  }

  async function handleClear() {
    await fetch("/api/clear", { method: "POST" });
    setStatus("All documents cleared.");
    setAnswer("");
    setSources([]);
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Chat With Your PDF</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
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
        className="bg-green-600 text-white px-4 py-2 rounded-lg mb-4"
      >
        Ask
      </button>

      <p className="text-gray-800 whitespace-pre-wrap mb-4">{answer}</p>

      {sources.length > 0 && (
        <div className="border-t pt-4">
          <h2 className="font-semibold mb-2 text-sm text-gray-500">
            SOURCES USED
          </h2>
          {sources.map((source) => (
            <div
              key={source.id}
              className="bg-gray-100 rounded-lg p-3 mb-2 text-sm text-gray-700"
            >
              <span className="font-medium">
                Source {source.id} (from {source.fileName}):
              </span>{" "}
              {source.text.slice(0, 200)}...
            </div>
          ))}

          <button
            onClick={handleClear}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm mb-4 ml-2"
          >
            Clear All Documents
          </button>
        </div>
      )}
    </main>
  );
}
