import { z } from "zod";

export const campaignInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type CampaignInput = z.infer<typeof campaignInputSchema>;
