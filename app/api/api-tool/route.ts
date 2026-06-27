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
    description: "Get the current weather for a city.",

    inputSchema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),

    // ✅ This gives part.output its TypeScript type
    outputSchema: z.object({
      location: z.object({
        name: z.string(),
        country: z.string(),
        localtime: z.string(),
      }),
      current: z.object({
        temp_c: z.number(),
        condition: z.object({
          text: z.string(),
          code: z.number(),
        }),
      }),
    }),

    execute: async ({ city }) => {
      console.log("========== WEATHER TOOL ==========");
      console.log("CITY:", city);

      const response = await fetch(
        `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${encodeURIComponent(
          city
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data.");
      }

      const data = await response.json();

      return {
        location: {
          name: data.location.name,
          country: data.location.country,
          localtime: data.location.localtime,
        },
        current: {
          temp_c: data.current.temp_c,
          condition: {
            text: data.current.condition.text,
            code: data.current.condition.code,
          },
        },
      };
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

    const modelMessages =
      await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-2.5-flash"),

      system: `
You are a weather assistant.

When a user asks about the weather,
ALWAYS call the getWeather tool.

Never make up weather information.

Always answer using the tool result.
`,

      messages: modelMessages,

      tools,

      // Tool call + Final answer
      stopWhen: stepCountIs(2),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
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