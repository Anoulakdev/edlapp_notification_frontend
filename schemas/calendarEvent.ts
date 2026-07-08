import { z } from "zod";

export const calendarEventSchema = z.object({
  id: z.number(),
  date: z.string(),
  title: z.string(),
  time: z.string(),
  color: z.string(),
});

export type Event = z.infer<typeof calendarEventSchema>;
