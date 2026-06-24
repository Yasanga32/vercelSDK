import { streamObject } from "ai";
import { google } from "@ai-sdk/google";
import { pokemonSchema } from "./schema";

export async function POST(req: Request) {
  try {
    const { type } = await req.json();

    const result = streamObject({
      model: google("gemini-2.5-flash"),
      output:"array",
      schema: pokemonSchema,
      prompt: `Generate a list of 5 ${type} type pokemon`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating pokemon :", error);

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