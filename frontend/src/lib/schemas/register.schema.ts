import { z } from 'zod';

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Vui lòng nhập Họ'),
    lastName: z.string().min(1, 'Vui lòng nhập Tên'),
    username: z
      .string()
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
      .max(20, 'Tên đăng nhập không được dài quá 20 ký tự'),
    email: z.string().min(1, 'Vui lòng nhập Email').email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
