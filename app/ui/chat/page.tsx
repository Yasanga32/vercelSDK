"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";

export default function ChatPage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    await sendMessage({
      text: input,
    });

    setInput("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
        {/* Messages Area */}
        <div className="h-96 mb-4 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400">
              Messages will appear here...
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200 text-black"
                  }`}
                >
                  <div className="mb-1 text-xs font-semibold opacity-70">
                    {message.role === "user" ? "You" : "AI"}
                  </div>

                  {message.parts.map((part, index) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <div
                            key={`${message.id}-${index}`}
                            className="whitespace-pre-wrap break-words"
                          >
                            {part.text}
                          </div>
                        );

                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            ))
          )}

          {status === "streaming" && (
            <div className="flex justify-start">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-black">
                <span className="animate-pulse">AI is typing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="How can I help you?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <button
              type="submit"
              disabled={status === "streaming"}
              className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition duration-200 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {status === "streaming" ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}