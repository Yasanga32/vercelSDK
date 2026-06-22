"use client";

import { useCompletion } from "@ai-sdk/react";

export default function StreamPage() {
    const {
        input,
        handleInputChange,
        handleSubmit,
        completion,
        isLoading,
        error,
        setInput,
        stop
    } = useCompletion({
        api: "/api/stream",
    });

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
                {/* Streaming Output Area */}
                <div className="h-96 border border-gray-200 rounded-xl p-4 mb-4 overflow-y-auto bg-gray-50">
                    {error && (
                        <div className="mb-4 rounded-md border border-red-300 bg-red-100 p-3 text-red-700">
                            {error.message}
                        </div>
                    )}

                    {isLoading && !completion && (
                        <div className="text-gray-500">Loading...</div>
                    )}

                    {completion ? (
                        <div className="text-black whitespace-pre-wrap break-words">
                            {completion}
                            {isLoading && (
                                <span className="animate-pulse font-bold ml-1">|</span>
                            )}
                        </div>
                    ) : (
                        !isLoading &&
                        !error && (
                            <p className="text-center text-gray-400">
                                AI response will appear here...
                            </p>
                        )
                    )}
                </div>

                {/* Input Form */}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    setInput("")
                    handleSubmit(e);
                }}>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="How can I help?"
                            value={input}
                            onChange={handleInputChange}
                            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-black focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {
                            isLoading ?
                                <button
                                    type="button"
                                    onClick={stop}
                                    className="rounded-xl bg-red-500 px-6 py-3 font-medium text-white transition duration-200 hover:bg-red-600 active:scale-95"
                                >
                                    Stop
                                </button> : (
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                                    >
                                        {isLoading ? "Generating..." : "Send"}
                                    </button>
                                )

                        }


                    </div>
                </form>
            </div>
        </div>
    );
}