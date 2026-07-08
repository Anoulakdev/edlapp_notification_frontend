import { z } from "zod";

export const sourceTypeBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ຊ່ອງທາງຮັບແຈ້ງ"),
  description: z.string().trim().optional().nullable().or(z.literal("")),
});

export const createSourceTypeSchema = sourceTypeBaseSchema;
export const editSourceTypeSchema = sourceTypeBaseSchema;

export const sourceTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
});

export type SourceType = z.infer<typeof sourceTypeSchema>;
