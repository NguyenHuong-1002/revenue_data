import { z } from 'zod';

export const createAccountSchema = z.object({
  fullname: z.string().min(1, 'Vui lòng nhập Họ và tên'),
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  mail: z.string().min(1, 'Vui lòng nhập Email').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.enum(['ADMIN', 'STAFF']),
  status_account: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export const editAccountSchema = z.object({
  fullname: z.string().min(1, 'Vui lòng nhập Họ và tên'),
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  mail: z.string().min(1, 'Vui lòng nhập Email').email('Email không hợp lệ'),
  password: z.string().optional().or(z.literal('')), // optional, if entered it will be updated
  role: z.enum(['ADMIN', 'STAFF']),
  status_account: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']),
});

export type EditAccountFormValues = z.infer<typeof editAccountSchema>;
