'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginFormValues } from '@/lib/schemas/login.schema';
import { accountService } from '@/lib/services/account.service';

export function useLogin() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null); // State lưu lỗi trả về từ server (ví dụ: Sai tài khoản, mật khẩu)

  // Khởi tạo React Hook Form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Kiểm tra xem code có đang chạy ở trình duyệt không (tránh lỗi SSR của Next.js)
      // Lấy thông tin tài khoản và mật khẩu đã lưu từ những lần đăng nhập trước (nếu có)
      const savedUser = localStorage.getItem('rememberedUsername');
      const savedPass = localStorage.getItem('rememberedPassword');
      if (savedUser && savedPass) {
        form.setValue('username', savedUser);
        form.setValue('password', savedPass);
        form.setValue('rememberMe', true);
      }
    }
  }, [form]);

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null); // Reset lại lỗi server về null trước khi gửi yêu cầu mới
    try {
      const res = await accountService.login({
        username: data.username,
        password: data.password,
      });

      // Save or clear remembered credentials
      if (data.rememberMe) {
        localStorage.setItem('rememberedUsername', data.username);
        localStorage.setItem('rememberedPassword', data.password);
      } else {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
      }

      localStorage.setItem('accessToken', res.data.accessToken);
      // eslint-disable-next-line react-hooks/immutability
      document.cookie = `accessToken=${res.data.accessToken}; path=/; max-age=86400; SameSite=Lax`; //path=/ cho phép truy cập full // max-age=86400 thời gian sống tối đa của cookie
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setServerError(axiosErr.response?.data?.message ?? 'Đăng nhập thất bại');
      } else {
        setServerError('Không thể kết nối đến máy chủ');
      }
    }
  };

  return {
    ...form,
    serverError,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(onSubmit),
  };
}
