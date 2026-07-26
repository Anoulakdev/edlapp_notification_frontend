import { z } from "zod";

export const messageAutoBaseSchema = z.object({
  topicId: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ message: "ກະລຸນາເລືອກຫົວຂໍ້" })
  ),
  messageTopic: z.string().trim().min(1, "ກະລຸນາໃສ່ຂໍ້ຄວາມອັດໂນມັດ"),
});

export const createMessageAutoSchema = messageAutoBaseSchema;
export const editMessageAutoSchema = messageAutoBaseSchema;

export const messageAutoSchema = z.object({
  id: z.number(),
  topicId: z.number(),
  messageTopic: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  topic: z
    .object({
      id: z.number(),
      name: z.string(),
      description: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type MessageAuto = z.infer<typeof messageAutoSchema>;
