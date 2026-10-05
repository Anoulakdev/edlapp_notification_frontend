import { z } from "zod";

export const typeEquipmentBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ໝວດໝູ່ອຸປະກອນ"),
  code: z.string().trim().optional().nullable().or(z.literal("")),
});

export const createTypeEquipmentSchema = typeEquipmentBaseSchema;
export const editTypeEquipmentSchema = typeEquipmentBaseSchema;

export const typeEquipmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable().optional(),
  actived: z.boolean().optional(),
  createdById: z.number(),
  createdBy: z
    .object({
      id: z.number(),
      employee: z
        .object({
          id: z.number(),
          first_name: z.string(),
          last_name: z.string(),
          emp_code: z.string(),
        })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  equipments: z
    .array(
      z.object({
        id: z.number(),
      })
    )
    .optional(),
});

export type TypeEquipment = z.infer<typeof typeEquipmentSchema>;
