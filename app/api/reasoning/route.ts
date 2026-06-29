import { UIMessage, streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: modelMessages,
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingBudget: 1024,
          },
        },
      },
    });



    return result.toUIMessageStreamResponse({
      sendReasoning:true,
    });
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