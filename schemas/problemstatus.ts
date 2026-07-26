import { z } from "zod";

export const problemStatusBaseSchema = z.object({
  edlapp: z.string().trim().min(1, "ກະລຸນາໃສ່ສະຖານະ EDL App"),
  callcenter: z.string().trim().min(1, "ກະລຸນາໃສ່ສະຖານະ Call Center"),
});

export const createProblemStatusSchema = problemStatusBaseSchema;
export const editProblemStatusSchema = problemStatusBaseSchema;

export const problemStatusSchema = z.object({
  id: z.number(),
  edlapp: z.string().nullable().optional().or(z.literal("")),
  callcenter: z.string().nullable().optional().or(z.literal("")),
});

export type ProblemStatus = z.infer<typeof problemStatusSchema>;
