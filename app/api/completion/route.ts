import {generateText} from "ai";
import { google } from "@ai-sdk/google";


export async function POST(){
    const {text} = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: "Explain what is an LLM is in simple terms",
    });

    return Response.json({text});

}