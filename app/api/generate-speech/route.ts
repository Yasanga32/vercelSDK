import { GoogleGenAI } from "@google/genai";

interface SpeechRequest {
  text: string;
}

// Helper function to prepend a 44-byte WAV/RIFF header to raw 16-bit Mono 24kHz PCM data
function prependWavHeader(pcmBase64: string, sampleRate: number = 24000): Buffer {
  const pcmBuffer = Buffer.from(pcmBase64, "base64");
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const chunkSize = 36 + dataSize;

  const header = Buffer.alloc(44);

  // RIFF identifier
  header.write("RIFF", 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write("WAVE", 8);

  // format chunk identifier
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // chunk size (16 for PCM)
  header.writeUInt16LE(1, 20);  // audio format (1 for uncompressed PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  // data chunk identifier
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<SpeechRequest>;

    if (!body || typeof body.text !== "string" || !body.text.trim()) {
      return Response.json({ error: "Missing or invalid 'text' field" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey?.trim()) {
      return Response.json({ error: "Server misconfiguration: Missing API Key" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ role: "user", parts: [{ text: body.text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
        },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
    const base64Audio = audioPart?.inlineData?.data;

    if (!base64Audio) {
      return Response.json({ error: "Gemini did not return any audio data." }, { status: 500 });
    }

    // Convert raw PCM into a legitimate browser-readable WAV buffer
    const wavBuffer = prependWavHeader(base64Audio, 24000);

    // Return the valid WAV file back as base64 to match your current frontend structure
    return Response.json({
      audio: wavBuffer.toString("base64"),
      mimeType: "audio/wav",
    });

  } catch (error) {
    console.error("[generate-speech] Critical Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}