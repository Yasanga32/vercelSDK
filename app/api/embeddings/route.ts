import { embedMany } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Branch 1: Valid array
        if (Array.isArray(body.texts)) {
            const { values, embeddings, usage } = await embedMany({
                model: google.embedding("gemini-embedding-2"),
                values: body.texts,
            });
            
            return Response.json({
                values,
                embeddings,
                usage,
                count: embeddings.length,
                dimensions: embeddings[0]?.length || 0,
            });
        } 
        
        // Branch 2: Invalid or missing array (This was missing!)
        return Response.json(
            { error: "Invalid request: 'texts' must be an array of strings." }, 
            { status: 400 }
        );

    } catch (error) {
        // Branch 3: Server or API error
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return Response.json({ error: errorMessage }, { status: 500 });
    }
}