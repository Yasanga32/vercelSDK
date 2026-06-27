import {
  streamText,
  UIMessage,
  convertToModelMessages,
  InferUITools,
  UIDataTypes,
  stepCountIs,
} from "ai";
import { google } from "@ai-sdk/google";

const tools = {
  web_search: google.tools.googleSearch({}),
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

      system: `
You are a helpful AI assistant.

When the user asks for information that requires current or live data
(news, weather, sports, prices, today's events, etc.),
always use the web_search tool.

Use the search results to answer.

Never invent recent information.
`,

      messages: modelMessages,

      tools,

      stopWhen: stepCountIs(2),
    });

    return result.toUIMessageStreamResponse({
      sendSources: true, //sending source part to the client
    });
  } catch (error) {
    console.error(error);

    return new Response(
      "Failed to stream chat completion",
      {
        status: 500,
      }
    );
  }
}