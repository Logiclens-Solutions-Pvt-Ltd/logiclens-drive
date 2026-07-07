import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  // Accepts URLs, sharing links, or even raw folder IDs pasted by mistake
  driveFolderLink: z.string().min(10, 'Please paste a valid Google Drive link or Folder ID'),
});

export type ProductFormValues = z.infer<typeof productSchema>;