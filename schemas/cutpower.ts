import { z } from "zod";

export const cutpowerBaseSchema = z.object({
  title: z.string().trim().min(1, "ກະລຸນາໃສ່ຫົວຂໍ້"),
  description: z.string().optional(),
  cutpowerDate: z.string().min(1, "ກະລຸນາໃສ່ວັນທີ"),
});

export const createCutpowerSchema = cutpowerBaseSchema.extend({
  file: z.any().refine((file) => file instanceof File, {
    message: "ກະລຸນາໃສ່ໄຟລ໌ເອກະສານ",
  }),
});

export const editCutpowerSchema = cutpowerBaseSchema.extend({
  file: z.any().optional(),
});

export const cutpowerDocSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional().nullable(),
  cutpowerDate: z.string(),
  cutpowerFile: z.string(),
  provinceId: z.number().nullable().optional(),
  districtId: z.number().nullable().optional(),
  createdById: z.number().nullable().optional(),
  province: z
    .object({
      id: z.number(),
      province_name: z.string(),
    })
    .nullable()
    .optional(),
  district: z
    .object({
      id: z.number(),
      district_name: z.string(),
    })
    .nullable()
    .optional(),
  createdBy: z
    .object({
      id: z.number(),
      employee: z
        .object({
          first_name: z.string(),
          last_name: z.string(),
          emp_code: z.string(),
        })
        .nullable()
        .optional(),
      username: z.string().optional().nullable(),
    })
    .nullable()
    .optional(),
  cutpowerAddresses: z
    .array(
      z.object({
        village: z.object({
          id: z.number(),
          village_name: z.string(),
        }),
      })
    )
    .optional(),
  createdAt: z.string(),
});

export type CutpowerDoc = z.infer<typeof cutpowerDocSchema>;
