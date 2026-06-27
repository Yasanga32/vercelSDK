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
  getLocation: tool({
    description:
      "Get the city where a person currently lives. Use this when the user asks for the weather of a person instead of a city.",

    inputSchema: z.object({
      name: z.string().describe("The person's name"),
    }),

    execute: async ({ name }) => {
      console.log("========== getLocation ==========");
      console.log("NAME:", name);

      if (name === "Bruce Wayne") {
        return "Gotham city";
      }

      if (name === "Clark Kent") {
        return "Metropolis";
      }

      return "Unknown";
    },
  }),

  getWeather: tool({
    description:
      "Get the current weather of a city. Always use this tool when the city is known.",

    inputSchema: z.object({
      city: z.string().describe("City name"),
    }),

    execute: async ({ city }) => {
      console.log("========== getWeather ==========");
      console.log("CITY:", city);

      if (city === "Gotham city") {
        return "70F and cloudy";
      }

      if (city === "Metropolis") {
        return "80F and sunny";
      }

      return "Weather unavailable";
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
You are a helpful weather assistant.

You have TWO tools:

1. getLocation
   - Finds the city where a person lives.

2. getWeather
   - Gets the weather for a city.

Rules:

• If the user asks for the weather of a PERSON:

Example:
"What's the weather for Bruce Wayne?"

You MUST:

1. Call getLocation.
2. Wait for the returned city.
3. Call getWeather using that city.
4. Answer using ONLY the tool results.

------------------------------------

If the user already provides a CITY:

Example:
"Weather in Metropolis"

Call ONLY getWeather.

------------------------------------

Never invent locations.

Never invent weather.

Always rely on the tools.
`,

      messages: modelMessages,

      tools,

      // Allows:
      // Step 1 -> getLocation
      // Step 2 -> getWeather
      // Step 3 -> Final response
      stopWhen: stepCountIs(3),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}