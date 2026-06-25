"use client";

import { useState, useRef, useEffect } from "react";

export default function GenerateSpeechPage() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAudio, setHasAudio] = useState(false);

  const audioUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null;
    }

    // Since we are now using a Data URL string instead of an Object URL,
    // we don't strictly need to call URL.revokeObjectURL, but we clean up the ref regardless.
    audioUrlRef.current = null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const inputText = text.trim();
    if (!inputText) {
      setError("Please enter some text.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasAudio(false);

    cleanupAudio();

    try {
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        // Read error payload cleanly from API JSON structure
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate audio");
      }

      // 1. Destructure the JSON payload from your server's Response.json()
      const { audio, mimeType } = await response.json();

      if (!audio) {
        throw new Error("No audio payload received from server");
      }

      // 2. Remap raw linear PCM MIME types so modern browsers parse the playback container correctly
      const normalizedMime = mimeType?.includes("audio/L16") ? "audio/wav" : mimeType;
      
      // 3. Construct a standard base64 Data URL 
      const audioUrl = `data:${normalizedMime};base64,${audio}`;
      audioUrlRef.current = audioUrl;

      // 4. Load the Data URL into an HTML5 Audio object
      const audioObj = new Audio(audioUrl);
      audioRef.current = audioObj;

      audioObj.onerror = (e) => {
        console.error("HTMLAudioElement error context:", e);
        setError("The browser failed to decode or play back the returned audio format.");
        setHasAudio(false);
      };

      await audioObj.play();
      setHasAudio(true);
      setText("");
    } catch (err) {
      console.error("Error generating audio:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setHasAudio(false);
    } finally {
      setIsLoading(false);
    }
  };

  const replayAudio = async () => {
    try {
      if (!audioRef.current) return;
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (err) {
      console.error("Error replaying audio:", err);
      setError("Could not replay audio.");
    }
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {isLoading && <div className="text-center mb-4">Generating audio...</div>}

      {hasAudio && !isLoading && (
        <button
          type="button"
          onClick={replayAudio}
          className="mb-4 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Replay Audio
        </button>
      )}

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
            placeholder="Enter text to convert to speech"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate
          </button>
        </div>
      </form>
    </div>
  );
}