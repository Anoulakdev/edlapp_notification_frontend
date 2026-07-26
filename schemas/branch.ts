import { z } from "zod";

export const branchBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ສາຂາແຂວງ"),
  code: z.string().trim().optional().nullable().or(z.literal("")),
});

export const createBranchSchema = branchBaseSchema;
export const editBranchSchema = branchBaseSchema;

export const branchSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable().optional(),
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
  repairDistricts: z
    .array(
      z.object({
        id: z.number(),
      })
    )
    .optional(),
});

export type Branch = z.infer<typeof branchSchema>;
