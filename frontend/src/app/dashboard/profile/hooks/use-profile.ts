'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import * as React from 'react';
import { toast } from 'sonner';
import { accountService } from '@/lib/services/account.service';
import type { InfoFormValues, PasswordChangeFormValues } from '../profile.schema';

export function useProfile() {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [fullname, setFullname] = React.useState<string>('');
  const [username, setUsername] = React.useState<string>('');
  const [mail, setMail] = React.useState<string>('');
  const [role, setRole] = React.useState<string>('STAFF');
  const [avatarURL, setAvatarURL] = React.useState<string | null>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);

  const [isEditInfoOpen, setIsEditInfoOpen] = React.useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);

  // Fetch current user details
  const loadProfile = React.useCallback(async () => {
    try {
      const res = await accountService.me();
      const user = res.data;
      setUserId(user.account_id);
      setFullname(user.fullname);
      setUsername(user.username);
      setMail(user.mail);
      setRole(user.role);
      setAvatarURL(user.avatarURL ?? null);
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Không thể tải thông tin hồ sơ');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Handle Avatar File Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 3MB
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Ảnh tải lên không được lớn quá 3MB');
      return;
    }

    setIsUploading(true);
    try {
      const res = await accountService.uploadAvatar(file);
      setAvatarURL(res.data.avatarURL);
      toast.success('Tải ảnh đại diện lên thành công!');

      // Update cache
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      toast.error('Không thể tải ảnh đại diện lên');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Profile Update Submission
  const onUpdateInfo = async (data: InfoFormValues) => {
    if (!userId) return;

    try {
      // Omit mail as requested by user (only display)
      const updateData = {
        fullname: data.fullname,
        username: data.username,
      };

      await accountService.update(userId, updateData);
      toast.success('Cập nhật thông tin thành công!', {
        description: 'Hệ thống sẽ cập nhật lại giao diện ngay lập tức.',
      });
      setIsEditInfoOpen(false);

      // Reload page to refresh all sidebar/header context
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Profile update failed:', err);
      const errorMsg = err.response?.data?.message;
      toast.error('Lỗi cập nhật thông tin', {
        description: Array.isArray(errorMsg)
          ? errorMsg.join(', ')
          : (errorMsg ?? 'Vui lòng kiểm tra lại thông tin.'),
      });
    }
  };

  // Handle Password Change Submission
  const onChangePassword = async (data: PasswordChangeFormValues) => {
    if (!userId) return;

    try {
      // Send ONLY new password to backend to avoid DTO validation whitelist errors
      const updateData = {
        password: data.password,
      };

      await accountService.update(userId, updateData);
      toast.success('Đổi mật khẩu thành công!', {
        description: 'Mật khẩu của bạn đã được cập nhật thành công.',
      });
      setIsChangePasswordOpen(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Password change failed:', err);
      const errorMsg = err.response?.data?.message;
      toast.error('Lỗi đổi mật khẩu', {
        description: Array.isArray(errorMsg)
          ? errorMsg.join(', ')
          : (errorMsg ?? 'Vui lòng kiểm tra lại thông tin.'),
      });
    }
  };

  return {
    userId,
    fullname,
    username,
    mail,
    role,
    avatarURL,
    isLoading,
    isUploading,
    isEditInfoOpen,
    setIsEditInfoOpen,
    isChangePasswordOpen,
    setIsChangePasswordOpen,
    handleAvatarChange,
    onUpdateInfo,
    onChangePassword,
  };
}
