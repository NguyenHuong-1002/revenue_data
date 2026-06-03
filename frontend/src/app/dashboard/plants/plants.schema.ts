import { z } from 'zod';

export const createPlantSchema = z.object({
  name_plant: z.string().min(1, 'Vui lòng nhập tên nhà kho'),
  address: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  manager_name: z.string().min(1, 'Vui lòng nhập tên người quản lý'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
});

export type CreatePlantFormValues = z.infer<typeof createPlantSchema>;

export const editPlantSchema = createPlantSchema;
export type EditPlantFormValues = CreatePlantFormValues;
