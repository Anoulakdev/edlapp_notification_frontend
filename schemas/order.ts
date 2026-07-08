import { z } from "zod";

export const orderSchema = z.object({
  id: z.string(),
  customer: z.string(),
  email: z.string().email(),
  amount: z.number(),
  status: z.enum(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]),
  date: z.string(),
  items: z.number(),
});

export type Order = z.infer<typeof orderSchema>;
