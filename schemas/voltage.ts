import { z } from "zod";

export const voltageBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ແຮງດັນ"),
});

export const createVoltageSchema = voltageBaseSchema;
export const editVoltageSchema = voltageBaseSchema;

export const voltageSchema = z.object({
  id: z.number(),
  name: z.string(),
  actived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  turnoffDocs: z
    .array(
      z.object({
        id: z.number(),
      })
    )
    .optional(),
  emergencyDocs: z
    .array(
      z.object({
        id: z.number(),
      })
    )
    .optional(),
  cutpowerDocs: z
    .array(
      z.object({
        id: z.number(),
      })
    )
    .optional(),
});

export type Voltage = z.infer<typeof voltageSchema>;
