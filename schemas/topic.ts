import { z } from "zod";

export const topicBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ຫົວຂໍ້"),
});

export const createTopicSchema = topicBaseSchema;
export const editTopicSchema = topicBaseSchema;

export const topicSchema = z.object({
  id: z.number(),
  name: z.string(),
  actived: z.boolean(),
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
  conversations: z
    .array(
      z.object({
        id: z.number(),
      })
    )
    .optional(),
});

export type Topic = z.infer<typeof topicSchema>;
