import { z } from "zod";

export const problemStatusBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ສະຖານະບັນຫາ"),
  name_edlapp: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ສະຖານະໃນ EDL App"),
});

export const createProblemStatusSchema = problemStatusBaseSchema;
export const editProblemStatusSchema = problemStatusBaseSchema;

export const problemStatusSchema = z.object({
  id: z.number(),
  name: z.string(),
  name_edlapp: z.string().nullable().optional().or(z.literal("")),
});

export type ProblemStatus = z.infer<typeof problemStatusSchema>;
