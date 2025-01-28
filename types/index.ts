import { insertProductSchema } from "@/lib/validators";
import { z } from "zod";

export type User = z.infer<typeof insertProductSchema> & {
  id: string;
  name: string;
  createdAt: Date;
}