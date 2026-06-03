import { z } from 'zod';

export const infoSchema = z.object({
  fullname: z.string().min(1, 'Vui lòng nhập Họ và tên'),
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  mail: z.string().min(1, 'Vui lòng nhập Email').email('Email không hợp lệ'),
});

export type InfoFormValues = z.infer<typeof infoSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    password: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Xác nhận mật khẩu mới phải có ít nhất 6 ký tự'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
