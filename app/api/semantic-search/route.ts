import { embed, embedMany, cosineSimilarity } from "ai";
import { google } from "@ai-sdk/google";

const movies = [
  { id: 1, title: "Inception", description: "A skilled thief enters people's dreams to steal secrets but is given the impossible task of planting an idea into someone's mind." },
  { id: 2, title: "The Dark Knight", description: "Batman faces the Joker, a ruthless criminal who pushes Gotham City into chaos and tests the hero's moral limits." },
  { id: 3, title: "Interstellar", description: "A group of astronauts travels through a wormhole in search of a new home for humanity as Earth becomes uninhabitable." },
  { id: 4, title: "The Matrix", description: "A computer programmer discovers that reality is a simulation and joins a rebellion to free humanity from machine control." },
  { id: 5, title: "Avengers: Endgame", description: "The remaining Avengers unite for one final mission to reverse the devastating effects of Thanos' actions and restore the universe." }
];

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return Response.json({ error: "Query is required" }, { status: 400 });
        }

        // 1. Bulk embed all movie descriptions (returns an array of vectors)
        const { embeddings: movieEmbeddings } = await embedMany({
            model: google.embedding("gemini-embedding-2"),
            values: movies.map((movie) => movie.description)
        });

        // 2. Embed the user's search query (returns a single vector) - Note the 'await'
        const { embedding: queryEmbedding } = await embed({
            model: google.embedding("gemini-embedding-2"),
            value: query,
        });

        // 3. Compute the similarity scores for each movie
        const moviesWithScores = movies.map((movie, index) => {
            const similarity = cosineSimilarity(queryEmbedding, movieEmbeddings[index]);
            return {
                ...movie,
                similarity: parseFloat(similarity.toFixed(4)) // Format score nicely
            };
        });

        // 4. Sort movies so the best match is at the top
        const sortedMovies = moviesWithScores.sort((a, b) => b.similarity - a.similarity);

        return Response.json({ results: sortedMovies });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Internal error";
        return Response.json({ error: errorMessage }, { status: 500 });
    }
}