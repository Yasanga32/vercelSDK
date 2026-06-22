"use client";

import { useState } from "react";

export default function CompletionPage() {
  const [prompt, setPrompt] = useState("");
  const [completion, setCompletion] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setCompletion(data.text);
      setPrompt("");
    } catch (error) {
      console.error("Error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 shadow-xl rounded-xl p-6">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          AI Completion Demo
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-400">
            {error}
          </div>
        )}

        {/* AI Response Area */}
        <div className="min-h-[250px] bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-4 overflow-y-auto">
          {isLoading ? (
            <p className="text-zinc-400">Thinking...</p>
          ) : completion ? (
            <p className="text-white whitespace-pre-wrap">{completion}</p>
          ) : (
            <p className="text-zinc-500">
              Ask me anything and I'll help you.
            </p>
          )}
        </div>

        <form onSubmit={complete}>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="How can I help you?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-zinc-950 text-white border border-zinc-700 rounded-lg placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:bg-zinc-700 disabled:cursor-not-allowed"
            >
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}