import { z } from "zod";

export const inviteInputSchema = z.object({
  email: z
    .email("Enter a valid email")
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .max(254, "Email is too long"),
});

export type InviteInput = z.infer<typeof inviteInputSchema>;

export const removeMemberInputSchema = z.object({
  userId: z.string().min(1, "User id is required"),
});

export type RemoveMemberInput = z.infer<typeof removeMemberInputSchema>;
