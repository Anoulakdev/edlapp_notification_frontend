import { z } from "zod";

export const problemTypeBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ປະເພດບັນຫາ"),
  code: z.string().trim().optional().nullable().or(z.literal("")),
});

export const createProblemTypeSchema = problemTypeBaseSchema;
export const editProblemTypeSchema = problemTypeBaseSchema;

export const problemTypeSchema = z.object({
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
  problemdocs: z
    .array(
      z.object({
        id: z.number(),
      })
    )
    .optional(),
});

export type ProblemType = z.infer<typeof problemTypeSchema>;
