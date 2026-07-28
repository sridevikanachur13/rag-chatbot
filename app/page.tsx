"use client";
import { useState } from "react";

interface Source {
  id: number;
  fileName: string;
  text: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleIngest() {
    if (!file) {
      setStatus("Select a PDF first.");
      return;
    }
    setStatus("Reading document…");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/ingest", { method: "POST", body: formData });
    const data = await res.json();
    setStatus(
      data.error
        ? `Couldn't read this file — ${data.error}`
        : `Indexed "${data.fileName}" — ${data.chunksIndexed} passages from ${data.extractedLength.toLocaleString()} characters`,
    );
  }

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    setSources([]);
    const res = await fetch("/api/rag-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) {
      setAnswer(`Something went wrong — ${data.error}`);
    } else {
      setAnswer(data.answer);
      setSources(data.sources || []);
    }
  }

  async function handleClear() {
    await fetch("/api/clear", { method: "POST" });
    setStatus("Document cleared.");
    setAnswer("");
    setSources([]);
  }

  return (
    <main
      className="min-h-screen"
      style={{ background: "#1B2230", fontFamily: "system-ui, sans-serif" }}
    >
      <div className="max-w-2xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="mb-10">
          <p
            className="text-xs tracking-[0.2em] uppercase mb-2"
            style={{ color: "#B8935F", fontFamily: "ui-monospace, monospace" }}
          >
            Document Q&A
          </p>
          <h1
            className="text-4xl mb-2"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: "#F7F4EC",
              fontWeight: 600,
            }}
          >
            Read anything. Ask everything.
          </h1>
          <p className="text-sm" style={{ color: "#8A93A3" }}>
            Upload a PDF — every answer below is grounded in its pages, cited
            like a footnote.
          </p>
        </div>

        {/* Upload card */}
        <div
          className="rounded-lg p-6 mb-6"
          style={{ background: "#F7F4EC", border: "1px solid #2A3342" }}
        >
          <label
            className="text-xs tracking-widest uppercase block mb-3"
            style={{ color: "#5B6472", fontFamily: "ui-monospace, monospace" }}
          >
            Source Document
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
              style={{ color: "#16191F" }}
            />
            <button
              onClick={handleIngest}
              className="px-4 py-2 rounded text-sm font-medium transition-colors"
              style={{ background: "#16191F", color: "#F7F4EC" }}
            >
              Index Document
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-2 rounded text-sm"
              style={{ color: "#5B6472", border: "1px solid #D8D2C2" }}
            >
              Clear
            </button>
          </div>
          {status && (
            <p className="text-sm mt-3" style={{ color: "#5B6472" }}>
              {status}
            </p>
          )}
        </div>

        {/* Question input */}
        <div className="flex gap-2 mb-8">
          <input
            className="flex-1 rounded px-4 py-3 text-sm outline-none"
            style={{
              background: "#F7F4EC",
              color: "#16191F",
              border: "1px solid #2A3342",
            }}
            placeholder="Ask a question about the document…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />
          <button
            onClick={handleAsk}
            className="px-5 py-3 rounded text-sm font-medium"
            style={{ background: "#B8935F", color: "#16191F" }}
          >
            {loading ? "…" : "Ask"}
          </button>
        </div>

        {/* Answer */}
        {(loading || answer) && (
          <div className="mb-8">
            <p
              className="text-xs tracking-widest uppercase mb-3"
              style={{
                color: "#8A93A3",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              Answer
            </p>
            <p
              className="text-lg leading-relaxed"
              style={{
                color: "#F7F4EC",
                fontFamily: "'Source Serif 4', Georgia, serif",
              }}
            >
              {loading ? "Reading…" : answer}
              {!loading &&
                sources.map((s) => (
                  <sup key={s.id} style={{ color: "#B8935F", marginLeft: 2 }}>
                    [{s.id}]
                  </sup>
                ))}
            </p>
          </div>
        )}

        {/* Sources - footnote style */}
        {sources.length > 0 && (
          <div style={{ borderTop: "1px solid #2A3342" }} className="pt-5">
            <p
              className="text-xs tracking-widest uppercase mb-4"
              style={{
                color: "#8A93A3",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              Footnotes
            </p>
            <div className="space-y-3">
              {sources.map((s) => (
                <div key={s.id} className="flex gap-3 text-sm">
                  <span
                    style={{
                      color: "#B8935F",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    [{s.id}]
                  </span>
                  <div>
                    <span style={{ color: "#8A93A3" }}>{s.fileName} — </span>
                    <span style={{ color: "#C7CDD6" }}>
                      {s.text.slice(0, 180)}…
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
