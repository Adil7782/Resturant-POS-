import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.coerce.number().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  cost: z.coerce.number().min(0, "Cost must be a positive number"),
  description: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productSchema>;
