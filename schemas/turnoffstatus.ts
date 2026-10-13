import { z } from "zod";

export const turnoffStatusBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ສະຖານະມອດໄຟ"),
});

export const createTurnoffStatusSchema = turnoffStatusBaseSchema;
export const editTurnoffStatusSchema = turnoffStatusBaseSchema;

export const turnoffStatusSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type TurnoffStatus = z.infer<typeof turnoffStatusSchema>;
