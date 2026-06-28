"use client";

import { useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import type { ChatMessage } from "@/app/api/generate-image-tool/route";

export default function GenerateImageToolPage() {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error, stop } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/generate-image-tool",
    }),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({ text: input, files });
    setInput("");
    setFiles(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md pt-12 pb-36 mx-auto stretch">
      {error && <div className="text-red-500 mb-4">{error.message}</div>}

      {messages.map((message) => (
        <div key={message.id} className="mb-4">
          <div className="font-semibold">
            {message.role === "user" ? "You:" : "AI:"}
          </div>
          {message.parts.map((part, index) => {
            switch (part.type) {
              case "text":
                return (
                  <div
                    key={`${message.id}-${index}`}
                    className="whitespace-pre-wrap"
                  >
                    {part.text}
                  </div>
                );
              case "file":
                if (part.mediaType?.startsWith("image/")) {
                  return (
                    <Image
                      key={`${message.id}-${index}`}
                      src={part.url}
                      alt={part.filename ?? `attachment-${index}`}
                      width={500}
                      height={500}
                    />
                  );
                }
                if (part.mediaType?.startsWith("application/pdf")) {
                  return (
                    <iframe //this tag for displaying pdf
                      key={`${message.id}-${index}`}
                      src={part.url}
                      width="500"
                      height="600"
                      title={part.filename ?? `attachment-${index}`}
                    />
                  );
                }
                return null;

              case "tool-generateImage":
                switch (part.state) {
                  case "input-streaming":
                    return (
                      <div
                        key={`${message.id}-${index}`}
                        className="mt-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />

                          <div>
                            <p className="font-semibold text-blue-300">
                              Preparing image generation...
                            </p>

                            <p className="text-sm text-zinc-400">
                              Creating tool request...
                            </p>
                          </div>
                        </div>
                      </div>
                    );

                  case "input-available":
                    return (
                      <div
                        key={`${message.id}-${index}`}
                        className="mt-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />

                          <div>
                            <p className="font-semibold text-yellow-300">
                              🎨 Generating Image
                            </p>

                            <p className="mt-1 text-sm text-zinc-300">
                              {part.input.prompt}
                            </p>
                          </div>
                        </div>
                      </div>
                    );

                  case "output-available":
                    return (
                      <div
                        key={`${message.id}-${index}`}
                        className="mt-4 overflow-hidden rounded-2xl border border-green-500/30 bg-zinc-900"
                      >
                        <div className="border-b border-green-500/20 bg-green-500/10 px-4 py-3">
                          <p className="font-semibold text-green-300">
                            ✅ Generated Image
                          </p>
                        </div>

                        <Image
                          src={`data:image/png;base64,${part.output.image}`}
                          alt="Generated image"
                          width={1024}
                          height={1024}
                          className="w-full object-cover"
                        />
                      </div>
                    );

                  case "output-error":
                    return (
                      <div
                        key={`${message.id}-${index}`}
                        className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-5"
                      >
                        <p className="font-semibold text-red-400">
                          ❌ Image generation failed
                        </p>

                        <p className="mt-2 text-sm text-red-300">
                          {part.errorText}
                        </p>
                      </div>
                    );

                  default:
                    return null;
                }
            }
          })}
        </div>
      ))}

      {(status === "submitted" || status === "streaming") && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
              {files?.length
                ? `${files.length} file${files.length > 1 ? "s" : ""} attached`
                : "Attach files"}
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(event) => {
                if (event.target.files) {
                  setFiles(event.target.files);
                }
              }}
              multiple
              ref={fileInputRef}
            />
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How can I help you?"
            />
            {status === "submitted" || status === "streaming" ? (
              <button
                onClick={stop}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={status !== "ready"}
              >
                Send
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}