import {
  UIMessage,
  UIDataTypes,
  InferUITools,
  streamText,
  convertToModelMessages,
  tool,
  stepCountIs,
  experimental_generateImage as generateImage,
} from "ai";

import { google } from "@ai-sdk/google";
import { z } from "zod";

const tools = {
  generateImage: tool({
    description: "Generate an image from a prompt.",

    inputSchema: z.object({
      prompt: z.string().describe("Prompt for the image"),
    }),

    execute: async ({ prompt }) => {
      const { image } = await generateImage({
        model: google.imageModel("imagen-4.0-generate-001"),
        prompt,
        size: "1024x1024",
      });

      return {
        image: image.base64,
      };
    },

    toModelOutput: () => ({
      type: "content",
      value: [
        {
          type: "text",
          text: "The image has been generated successfully.",
        },
      ],
    }),
  }),
};

export type ChatTools = InferUITools<typeof tools>;

export type ChatMessage = UIMessage<
  never,
  UIDataTypes,
  ChatTools
>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } =
      await req.json();

    const modelMessages =
      await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-2.5-flash"),

      messages: modelMessages,

      tools,

      stopWhen: stepCountIs(2),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);

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