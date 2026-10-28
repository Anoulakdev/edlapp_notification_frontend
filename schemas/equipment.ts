import { z } from "zod";

export const equipmentBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ອຸປະກອນ"),
  unit: z.string().trim().min(1, "ກະລຸນາໃສ່ຫົວໜ່ວຍ"),
});

export const createEquipmentSchema = equipmentBaseSchema;
export const updateEquipmentSchema = equipmentBaseSchema;

export const equipmentSchema = z.object({
  id: z.number(),
  branchId: z.number().optional(),
  name: z.string(),
  unit: z.string(),
  actived: z.boolean().optional(),
  createdById: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  branch: z
    .object({
      id: z.number(),
      name: z.string(),
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
