import { z } from "zod";

export const fileItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.enum(["folder", "image", "video", "audio", "doc", "code", "file"]),
  size: z.string().optional(),
  modified: z.string(),
  items: z.number().optional(),
});

export type FileItem = z.infer<typeof fileItemSchema>;
