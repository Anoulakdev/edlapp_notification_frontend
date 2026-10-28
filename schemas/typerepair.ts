import { z } from "zod";

export const typeRepairBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ປະເພດສ້ອມແປງ"),
});

export const createTypeRepairSchema = typeRepairBaseSchema;
export const editTypeRepairSchema = typeRepairBaseSchema;

export const typeRepairSchema = z.object({
  id: z.number(),
  name: z.string(),
  actived: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type TypeRepair = z.infer<typeof typeRepairSchema>;
