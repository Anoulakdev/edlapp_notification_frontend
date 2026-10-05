import { z } from "zod";

export const typeUnitBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ຫົວໜ່ວຍ"),
});

export const createTypeUnitSchema = typeUnitBaseSchema;
export const editTypeUnitSchema = typeUnitBaseSchema;

export const typeUnitSchema = z.object({
  id: z.number(),
  name: z.string(),
  actived: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  problemEquipments: z
    .array(
      z.object({
        id: z.number(),
      })
    )
    .optional(),
});

export type TypeUnit = z.infer<typeof typeUnitSchema>;
