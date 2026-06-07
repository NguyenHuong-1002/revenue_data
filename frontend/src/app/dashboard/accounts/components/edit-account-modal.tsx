'use client';

// ===== Modal SỬA thông tin tài khoản =====
// Form tương tự create nhưng có pre-fill dữ liệu từ account hiện tại
// Password để trống = giữ nguyên mật khẩu cũ

import * as React from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveIcon, Camera, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { editAccountSchema, type EditAccountFormValues } from '../accounts.schema';
import { IAccount } from '@/lib/types/account';
import { toast } from 'sonner';
import { accountService } from '@/lib/services/account.service';
import { getAvatarUrl } from '@/lib/avatar';

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: IAccount | null;
  onSubmit: (data: EditAccountFormValues) => Promise<void>;
}

export function EditAccountModal({ isOpen, onClose, account, onSubmit }: EditAccountModalProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const form = useForm<EditAccountFormValues>({
    resolver: zodResolver(editAccountSchema),
    defaultValues: {
      fullname: '', username: '', mail: '', password: '',
      role: 'STAFF', status_account: 'ACTIVE', avatarURL: '',
    },
  });

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isSubmitting },
  } = form;

  // Khi mở modal, pre-fill dữ liệu từ account được chọn
  React.useEffect(() => {
    if (isOpen && account) {
      reset({
        fullname: account.fullname || '',
        username: account.username || '',
        mail: account.mail || '',
        password: '', // Luôn để trống password khi sửa
        role: account.role || 'STAFF',
        status_account: account.status_account || 'ACTIVE',
        avatarURL: account.avatarURL || '',
      });
    }
  }, [isOpen, account, reset]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh (png, jpg, jpeg...)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 2MB');
      return;
    }

    try {
      setIsUploading(true);
      const res = await accountService.uploadAvatar(file);
      if (res.data.success || res.data.avatarURL) {
        form.setValue('avatarURL', res.data.avatarURL);
        toast.success('Tải ảnh đại diện lên thành công!');
      } else {
        toast.error('Không thể tải ảnh đại diện lên.');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải ảnh đại diện.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormSubmit = async (data: EditAccountFormValues) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Lỗi đã được xử lý ở parent
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cập nhật tài khoản">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FieldGroup className="gap-3">
            {/* Ảnh đại diện */}
            <div className="flex flex-col items-center justify-center py-2 pb-4">
              <div
                onClick={handleAvatarClick}
                className="relative group cursor-pointer size-20 rounded-full border border-dashed border-border hover:border-blue-500 transition-all flex items-center justify-center overflow-hidden bg-muted/40"
              >
                {isUploading ? (
                  <Loader2 className="size-6 text-blue-500 animate-spin" />
                ) : form.watch('avatarURL') ? (
                  <img
                    src={getAvatarUrl(form.watch('avatarURL'))}
                    alt="Avatar Preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:text-blue-500 transition-colors">
                    <Camera className="size-5 mb-0.5" />
                    <span className="text-[10px] font-medium">Chọn ảnh</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                  Tải ảnh lên
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <span className="text-[10px] text-muted-foreground mt-1.5">Ảnh vuông, tối đa 2MB</span>
            </div>
            {/* Họ và tên */}
            <Field>
              <FieldLabel htmlFor="edit-fullname">Họ và tên</FieldLabel>
              <Input id="edit-fullname" placeholder="Nhập họ và tên" {...register('fullname')} data-invalid={!!errors.fullname} />
              <FieldError errors={[errors.fullname]} />
            </Field>

            {/* Tên đăng nhập */}
            <Field>
              <FieldLabel htmlFor="edit-username">Tên đăng nhập</FieldLabel>
              <Input id="edit-username" placeholder="Nhập tên đăng nhập" {...register('username')} data-invalid={!!errors.username} />
              <FieldError errors={[errors.username]} />
            </Field>

            {/* Email */}
            <Field>
              <FieldLabel htmlFor="edit-mail">Địa chỉ Email</FieldLabel>
              <Input id="edit-mail" type="email" placeholder="Nhập địa chỉ email" {...register('mail')} data-invalid={!!errors.mail} />
              <FieldError errors={[errors.mail]} />
            </Field>

            {/* Mật khẩu mới (optional) */}
            <Field>
              <FieldLabel htmlFor="edit-password">Mật khẩu mới</FieldLabel>
              <Input id="edit-password" type="password" placeholder="Nhập mật khẩu mới nếu muốn thay đổi" {...register('password')} data-invalid={!!errors.password} />
              <FieldDescription>Để trống nếu bạn không muốn thay đổi mật khẩu của tài khoản này.</FieldDescription>
              <FieldError errors={[errors.password]} />
            </Field>

            {/* Vai trò */}
            <Field>
              <FieldLabel htmlFor="edit-role">Vai trò</FieldLabel>
              <Controller name="role" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="edit-role" className="w-full"><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Nhân viên (STAFF)</SelectItem>
                    <SelectItem value="ADMIN">Quản trị viên (ADMIN)</SelectItem>
                  </SelectContent>
                </Select>
              )} />
              <FieldError errors={[errors.role]} />
            </Field>

            {/* Trạng thái */}
            <Field>
              <FieldLabel htmlFor="edit-status">Trạng thái</FieldLabel>
              <Controller name="status_account" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="edit-status" className="w-full"><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Hoạt động (ACTIVE)</SelectItem>
                    <SelectItem value="INACTIVE">Ngừng hoạt động (INACTIVE)</SelectItem>
                    <SelectItem value="LOCKED">Khóa (LOCKED)</SelectItem>
                  </SelectContent>
                </Select>
              )} />
              <FieldError errors={[errors.status_account]} />
            </Field>
          </FieldGroup>

          {/* Nút Hủy / Lưu thay đổi */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}
              className="border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer">Hủy</Button>
            <Button type="submit" disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 cursor-pointer">
              <SaveIcon className="size-4 mr-2" />
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
