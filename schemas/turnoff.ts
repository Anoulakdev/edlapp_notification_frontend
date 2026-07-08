import { z } from "zod";

export const turnoffBaseSchema = z.object({
  title: z.string().trim().min(1, "ກະລຸນາໃສ່ຫົວຂໍ້"),
  description: z.string().optional(),
  startDate: z.string().min(1, "ກະລຸນາໃສ່ວັນທີເລີ່ມຕົ້ນ"),
  endDate: z.string().min(1, "ກະລຸນາໃສ່ວັນທີສິ້ນສຸດ"),
  startTime: z.string().min(1, "ກະລຸນາໃສ່ເວລາເລີ່ມຕົ້ນ"),
  endTime: z.string().min(1, "ກະລຸນາໃສ່ເວລາສິ້ນສຸດ"),
});

export const createTurnoffSchema = turnoffBaseSchema.extend({
  file: z.any().refine((file) => file instanceof File, {
    message: "ກະລຸນາໃສ່ໄຟລ໌ເອກະສານ",
  }),
});

export const editTurnoffSchema = turnoffBaseSchema.extend({
  file: z.any().optional(),
});

export const assignVillagesSchema = z.object({
  selectedVillages: z.array(z.number()).min(1, "ກະລຸນາເລືອກຢ່າງໜ້ອຍ 1 ບ້ານ"),
});

export const turnoffDocSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  turnoffFile: z.string(),
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
  turnoffAddresses: z
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

export type TurnoffDoc = z.infer<typeof turnoffDocSchema>;
