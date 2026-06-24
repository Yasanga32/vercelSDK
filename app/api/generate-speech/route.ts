import { google } from "@ai-sdk/google";
import { experimental_generateSpeech as generateSpeech } from "ai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const { audio } = await generateSpeech({
      model: google.speechModel!("gemini-2.5-pro-preview-tts"),
      text,
    });

    return Response.json({
      audio: audio.base64,
    });
  } catch (error) {
    console.error("Speech Generation Error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred",
      },
      {
        status: 500,
      }
    );
  }
}