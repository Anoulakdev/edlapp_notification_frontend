import { z } from "zod";

export const equipmentBaseSchema = z.object({
  typeEquipmentId: z.coerce.number().min(1, "ກະລຸນາເລືອກໝວດໝູ່ອຸປະກອນ"),
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ອຸປະກອນ"),
});

export const createEquipmentSchema = equipmentBaseSchema;
export const updateEquipmentSchema = equipmentBaseSchema;

export const equipmentSchema = z.object({
  id: z.number(),
  typeEquipmentId: z.number(),
  name: z.string(),
  actived: z.boolean().optional(),
  createdById: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  typeEquipment: z
    .object({
      id: z.number(),
      name: z.string(),
      code: z.string().nullable().optional(),
      actived: z.boolean().optional(),
    })
    .nullable()
    .optional(),
  createdBy: z
    .object({
      id: z.number(),
      employee: z
        .object({
          id: z.number(),
          first_name: z.string(),
          last_name: z.string(),
          emp_code: z.string(),
          gender: z.string().nullable().optional(),
        })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
});

export type Equipment = z.infer<typeof equipmentSchema>;
