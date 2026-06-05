import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên chi nhánh'),
  city: z.string().min(1, 'Vui lòng nhập thành phố'),
  address: z.string().optional().nullable(),
});

export type CreateBranchFormValues = z.infer<typeof createBranchSchema>;

export const editBranchSchema = createBranchSchema;
export type EditBranchFormValues = CreateBranchFormValues;
