import { z } from "zod";

export const emergencyBaseSchema = z.object({
  title: z.string().trim().min(1, "ກະລຸນາໃສ່ຫົວຂໍ້"),
  description: z.string().optional(),
  emergencyDate: z.string().min(1, "ກະລຸນາໃສ່ວັນທີ"),
  startTime: z.string().trim().optional().nullable().or(z.literal("")),
  endTime: z.string().trim().optional().nullable().or(z.literal("")),
  lat: z.preprocess((val) => (val === "" || val === undefined || val === null ? undefined : Number(val)), z.number().optional()),
  lng: z.preprocess((val) => (val === "" || val === undefined || val === null ? undefined : Number(val)), z.number().optional()),
});

export const createEmergencySchema = emergencyBaseSchema.extend({
  file: z.any().refine((file) => file instanceof File, {
    message: "ກະລຸນາໃສ່ຮູບພາບ",
  }),
});

export const editEmergencySchema = emergencyBaseSchema.extend({
  file: z.any().optional(),
});

export const emergencyDocSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional().nullable(),
  emergencyDate: z.string(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  emergencyImg: z.string(),
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
  emergencyAddresses: z
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

export type EmergencyDoc = z.infer<typeof emergencyDocSchema>;
