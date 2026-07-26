import { z } from "zod";

export const repairDistrictBaseSchema = z.object({
  branchId: z.coerce.number().min(1, "ກະລຸນາເລືອກສາຂາແຂວງ"),
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ສູນສ້ອມແປງເມືອງ"),
  code: z.string().trim().optional().nullable().or(z.literal("")),
});

export const createRepairDistrictSchema = repairDistrictBaseSchema;
export const updateRepairDistrictSchema = repairDistrictBaseSchema;

export const repairDistrictSchema = z.object({
  id: z.number(),
  branchId: z.number(),
  name: z.string(),
  code: z.string().nullable().optional(),
  createdById: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  branch: z
    .object({
      id: z.number(),
      name: z.string(),
      code: z.string().nullable().optional(),
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

export type RepairDistrict = z.infer<typeof repairDistrictSchema>;
