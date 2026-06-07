'use client';

// ===== Modal TẠO tài khoản mới =====
// Form gồm: họ tên, username, email, password, vai trò, trạng thái
// Dùng react-hook-form + Zod để validate

import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlusIcon, Camera, Loader2 } from 'lucide-react';
import * as React from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAvatarUrl } from '@/lib/avatar';
import { accountService } from '@/lib/services/account.service';
import { createAccountSchema, type CreateAccountFormValues } from '../accounts.schema';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountFormValues) => Promise<void>;
}

export function CreateAccountModal({ isOpen, onClose, onSubmit }: CreateAccountModalProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Khởi tạo form với react-hook-form + Zod resolver
  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      fullname: '',
      username: '',
      mail: '',
      password: '',
      role: 'STAFF',
      status_account: 'ACTIVE',
      avatarURL: '',
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // Reset form mỗi khi mở modal
  React.useEffect(() => {
    if (isOpen) {
      reset({
        fullname: '',
        username: '',
        mail: '',
        password: '',
        role: 'STAFF',
        status_account: 'ACTIVE',
        avatarURL: '',
      });
    }
  }, [isOpen, reset]);

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

  // Xử lý submit: gọi lên parent, nếu thành công thì đóng modal
  const handleFormSubmit = async (data: CreateAccountFormValues) => {
    try {
      await onSubmit(data);
      onClose();
    } catch {
      // Lỗi đã được xử lý ở parent (toast)
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm tài khoản mới">
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
              <span className="text-[10px] text-muted-foreground mt-1.5">
                Ảnh vuông, tối đa 2MB
              </span>
            </div>
            {/* Họ và tên */}
            <Field>
              <FieldLabel htmlFor="create-fullname">Họ và tên</FieldLabel>
              <Input
                id="create-fullname"
                placeholder="Nhập họ và tên đầy đủ"
                {...register('fullname')}
                data-invalid={!!errors.fullname}
              />
              <FieldError errors={[errors.fullname]} />
            </Field>

            {/* Tên đăng nhập */}
            <Field>
              <FieldLabel htmlFor="create-username">Tên đăng nhập</FieldLabel>
              <Input
                id="create-username"
                placeholder="Nhập tên đăng nhập (ví dụ: nguyenvana)"
                {...register('username')}
                data-invalid={!!errors.username}
              />
              <FieldError errors={[errors.username]} />
            </Field>

            {/* Email */}
            <Field>
              <FieldLabel htmlFor="create-mail">Địa chỉ Email</FieldLabel>
              <Input
                id="create-mail"
                type="email"
                placeholder="Nhập địa chỉ email"
                {...register('mail')}
                data-invalid={!!errors.mail}
              />
              <FieldError errors={[errors.mail]} />
            </Field>

            {/* Mật khẩu */}
            <Field>
              <FieldLabel htmlFor="create-password">Mật khẩu</FieldLabel>
              <Input
                id="create-password"
                type="password"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                {...register('password')}
                data-invalid={!!errors.password}
              />
              <FieldError errors={[errors.password]} />
            </Field>

            {/* Vai trò (ADMIN / STAFF) */}
            <Field>
              <FieldLabel htmlFor="create-role">Vai trò</FieldLabel>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="create-role" className="w-full">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAFF">Nhân viên (STAFF)</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên (ADMIN)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.role]} />
            </Field>

            {/* Trạng thái (ACTIVE / INACTIVE / LOCKED) */}
            <Field>
              <FieldLabel htmlFor="create-status">Trạng thái</FieldLabel>
              <Controller
                name="status_account"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="create-status" className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Hoạt động (ACTIVE)</SelectItem>
                      <SelectItem value="INACTIVE">Ngừng hoạt động (INACTIVE)</SelectItem>
                      <SelectItem value="LOCKED">Khóa (LOCKED)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.status_account]} />
            </Field>
          </FieldGroup>

          {/* Nút Hủy / Thêm tài khoản */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
              className="border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 cursor-pointer"
            >
              <UserPlusIcon className="size-4 mr-2" />
              {isSubmitting ? 'Đang tạo...' : 'Thêm tài khoản'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
