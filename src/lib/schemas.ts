import { z } from "zod";

export const teamNameSchema = z.object({
  teamName: z.string().min(3, "Team name must be at least 3 characters"),
});

export const kfidSchema = z.object({
  kfid: z.string().regex(/^[A-Z0-9]+$/, "Invalid KFID format"),
});

export const teamRegisterSchema = z.object({
  team_name: z.string(),
  kfids: z.array(z.string()).min(2).max(3),
});

export type TeamRegisterRequest = z.infer<typeof teamRegisterSchema>;
export type TeamRegisterResponse = {
  team_id: string;
  password: string;
};
