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
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY!,
});

async function uploadImage(image: string) {
  const response = await imagekit.upload({
    file: image,
    fileName: `generated-${Date.now()}.png`,
  });

  return response.url;
}

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

      // Upload generated image to ImageKit
      const imageUrl = await uploadImage(image.base64);

      // Return the URL instead of base64
      return {
        image: imageUrl,
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