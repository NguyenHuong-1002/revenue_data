'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useLogout() {
  const router = useRouter();

  const handleLogout = () => {
    // 1. Clear accessToken from local storage
    localStorage.removeItem('accessToken');

    // 2. Clear cookie for Middleware route guard
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';

    // 3. Display success toast notification
    toast.success('Đăng xuất thành công', {
      description: 'Hẹn gặp lại bạn lần sau!',
      duration: 3000,
    });

    // 4. Redirect user to landing page
    router.replace('/');
  };

  return { handleLogout };
}
