'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { registerSchema, type RegisterFormValues } from '@/lib/schemas/register.schema';
import { accountService } from '@/lib/services/account.service';

export function useRegister() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const payload = {
        fullname: `${data.firstName} ${data.lastName}`.trim(),
        username: data.username,
        password: data.password,
        mail: data.email,
      };
      await accountService.register(payload);
      console.log('PAYLOAD : ', payload);

      toast.success('Đăng ký thành công!', {
        description: 'Tài khoản mới đã được khởi tạo. Đang chuyển hướng...',
        duration: 3000,
      });
      setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển hướng...');

      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: unknown) {
      let errMsg = 'Đăng ký thất bại';

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
        const msg = axiosErr.response?.data?.message;
        if (Array.isArray(msg)) {
          errMsg = msg.join(', ');
        } else if (typeof msg === 'string') {
          errMsg = msg;
        }
      } else {
        errMsg = 'Không thể kết nối đến máy chủ';
      }

      // Friendly translations for backend constraints
      let friendlyMsg = errMsg;
      if (errMsg === 'Username da ton tai') {
        friendlyMsg = 'Tên đăng nhập này đã có người sử dụng.';
      } else if (errMsg === 'Email da ton tai') {
        friendlyMsg = 'Địa chỉ email này đã được đăng ký trước đó.';
      }

      setServerError(friendlyMsg);

      // Trigger error popup on the right
      toast.error('Lỗi đăng ký tài khoản', {
        description: friendlyMsg,
        duration: 5000,
      });
    }
  };

  return {
    ...form,
    serverError,
    successMessage,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit: form.handleSubmit(onSubmit),
  };
}
