import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      output: "enum",
      enum: ["positive", "negative", "neutral"],
      prompt: `Classify the sentiment of this text: "${text}"`,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error("Error generating sentiment:", error);

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