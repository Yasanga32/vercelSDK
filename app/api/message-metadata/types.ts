import { UIMessage } from "ai";
import z from "zod";

export const messageMetadataSchema = z.object({
    createdAt: z.number().optional(),
    totalTokens: z.number().optional(),
});

export type messageMetadata = z.infer<typeof messageMetadataSchema>

export type MyUIMessage = UIMessage<messageMetadata>