import { z } from "zod";

export const meterStatusBaseSchema = z.object({
  edlapp: z.string().trim().min(1, "ກະລຸນາໃສ່ສະطانະ EDL App"),
  callcenter: z.string().trim().min(1, "ກະລຸນາໃສ່ສະຖານະ Call Center"),
});

export const createMeterStatusSchema = meterStatusBaseSchema;
export const editMeterStatusSchema = meterStatusBaseSchema;

export const meterStatusSchema = z.object({
  id: z.number(),
  edlapp: z.string().nullable().optional(),
  callcenter: z.string().nullable().optional(),
});

export type MeterStatus = z.infer<typeof meterStatusSchema>;
