import { z } from "zod";

export const activityBaseSchema = z.object({
  title: z.string().trim().min(1, "ກະລຸນາໃສ່ຫົວຂໍ້ກິດຈະກຳ"),
  content: z.string().trim().min(1, "ກະລຸນາໃສ່ເນື້ອໃນກິດຈະກຳ"),
  location: z.string().trim().min(1, "ກະລຸນາໃສ່ສະຖານທີ່"),
  startDate: z.string().min(1, "ກະລຸນາເລືອກວັນທີເລີ່ມຕົ້ນ"),
  endDate: z.string().min(1, "ກະລຸນາເລືອກວັນທີສິ້ນສຸດ"),
});

export const createActivitySchema = activityBaseSchema;
export const editActivitySchema = activityBaseSchema;

export const activitySchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string(),
  actFile: z.string(),
  createdById: z.number(),
  createdBy: z
    .object({
      id: z.number(),
      employee: z
        .object({
          id: z.number(),
          first_name: z.string(),
          last_name: z.string(),
          gender: z.string().nullable().optional(),
          emp_code: z.string(),
        })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Activity = z.infer<typeof activitySchema>;
