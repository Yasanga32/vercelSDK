import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return Response.json(
        {
          error: "No audio file provided",
        },
        {
          status: 400,
        }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: uint8Array,
              mediaType: audioFile.type,
            },
            {
              type: "text",
              text: "Transcribe this audio exactly as spoken.",
            },
          ],
        },
      ],
    });

    return Response.json({
      transcript: result.text,
    });
  } catch (error) {
    console.error("Transcription Error:", error);

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