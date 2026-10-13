import { z } from "zod";

export const emergencyStatusBaseSchema = z.object({
  name: z.string().trim().min(1, "ກະລຸນາໃສ່ຊື່ສະຖານະມອດໄຟສຸກເສີນ"),
});

export const createEmergencyStatusSchema = emergencyStatusBaseSchema;
export const editEmergencyStatusSchema = emergencyStatusBaseSchema;

export const emergencyStatusSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type EmergencyStatus = z.infer<typeof emergencyStatusSchema>;
