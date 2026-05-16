import {z} from "zod";

export const saveGeneratedProfileSchema = z.object({
    notes: z.string().optional(),
});

export type SaveGeneratedProfileFormValues = z.infer<
    typeof saveGeneratedProfileSchema
>;