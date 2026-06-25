import {
  UIMessage,
  InferUITools,
  UIDataTypes,
  streamText,
  convertToModelMessages,
  tool,
  stepCountIs,
} from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const tools = {
  getWeather: tool({
    description: "Get the weather for a location",
    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),

    execute: async ({ city }) => {
      console.log("=================================");
      console.log("TOOL CALLED");
      console.log("CITY:", city);
      console.log("=================================");

      if (city === "Gotham city") {
        return "70F and cloudy";
      }

      if (city === "Metropolis") {
        return "80F and sunny";
      }

      return "Unknown";
    },
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
    console.log("========== NEW REQUEST ==========");

    const { messages }: { messages: ChatMessage[] } =
      await req.json();

    console.log(
      "MESSAGES RECEIVED:",
      JSON.stringify(messages, null, 2)
    );

    const modelMessages =
      await convertToModelMessages(messages);

    console.log(
      "MODEL MESSAGES:",
      JSON.stringify(modelMessages, null, 2)
    );

    const result = streamText({
      model: google("gemini-2.5-flash"),

      system: `
You are a weather assistant.

When the user asks about weather,
ALWAYS call the getWeather tool.

Never answer weather questions from your own knowledge.

Use the tool result to generate the final answer.
`,

      messages: modelMessages,

      tools,

      stopWhen: stepCountIs(2),
    });

    console.log("STREAM CREATED");

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("========== ERROR ==========");
    console.error(error);

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