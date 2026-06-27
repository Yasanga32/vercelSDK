"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatMessage } from "@/app/api/web-search-tool/route";

export default function WebSearchToolPage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error, stop } =
    useChat<ChatMessage>({
      transport: new DefaultChatTransport({
        api: "/api/web-search-tool",
      }),
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    await sendMessage({
      text: input,
    });

    setInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[90vh] backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              AI Assistant
            </h1>
            <p className="text-sm text-gray-400">
              Powered by AI SDK + Tools
            </p>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${status === "streaming"
                ? "bg-green-500/20 text-green-400"
                : "bg-gray-500/20 text-gray-300"
              }`}
          >
            {status}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-white text-2xl font-semibold mb-2">
                  Welcome 👋
                </h2>
                <p className="text-gray-400">
                  Ask anything to get started.
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user"
                  ? "justify-end"
                  : "justify-start"
                }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-lg ${message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 backdrop-blur-md border border-white/10 text-white"
                  }`}
              >
                <div className="mb-2 text-xs uppercase tracking-wider opacity-60">
                  {message.role === "user" ? "You" : "Assistant"}
                </div>

                {message.parts.map((part, index) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div
                          key={`${message.id}-${index}`}
                          className="whitespace-pre-wrap break-words leading-7"
                        >
                          {part.text}
                        </div>
                      );

                    case "tool-web_search":
                      switch (part.state) {
                        case "input-streaming":
                          return (
                            <div
                              key={`${message.id}-${index}`}
                              className="mt-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4"
                            >
                              <p className="text-blue-300">
                                🔍 Preparing web search...
                              </p>
                            </div>
                          );

                        case "input-available":
                          return (
                            <div
                              key={`${message.id}-${index}`}
                              className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4"
                            >
                              <p className="text-yellow-300">
                                🌐 Searching Google...
                              </p>
                            </div>
                          );

                        case "output-available":
                          return (
                            <div
                              key={`${message.id}-${index}`}
                              className="mt-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
                            >
                              <p className="text-green-300">
                                ✅ Search complete.
                              </p>
                            </div>
                          );

                        case "output-error":
                          return (
                            <div
                              key={`${message.id}-${index}`}
                              className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
                            >
                              <p className="text-red-300">
                                {part.errorText}
                              </p>
                            </div>
                          );

                        default:
                          return null;
                      }

                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          ))}

          {status === "streaming" && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-white">
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-3 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-300">
            {error.message}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-white/10 p-5"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              placeholder="Ask me anything..."
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-2xl bg-white/10 border border-white/10 px-5 py-4 text-white placeholder:text-gray-400 outline-none focus:border-blue-500"
            />

            {status === "streaming" ? (
              <button
                type="button"
                onClick={() => stop()}
                className="rounded-2xl bg-red-600 px-6 py-4 text-white font-medium hover:bg-red-700 transition"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-8 py-4 text-white font-medium hover:bg-blue-700 transition"
              >
                Send
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}