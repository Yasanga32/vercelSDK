import { google } from "@ai-sdk/google";
import { experimental_generateImage as generateImage } from "ai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const { image } = await generateImage({
      model: google.image("imagen-4.0-generate-001"),
      prompt,
      aspectRatio: "1:1",
    });

    return Response.json({
      image: image.base64,
    });
  } catch (error) {
    console.error("Image Generation Error:", error);

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