import { z } from "zod";

export const roleBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ສິດຜູ້ໃຊ້ງານ"),
  description: z.string().trim().optional().nullable().or(z.literal("")),
});

export const createRoleSchema = roleBaseSchema;
export const editRoleSchema = roleBaseSchema;

export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
});

export type Role = z.infer<typeof roleSchema>;
