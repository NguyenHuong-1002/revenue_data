'use client';

// ===== Modal TẠO tài khoản mới =====
// Form gồm: họ tên, username, email, password, vai trò, trạng thái
// Dùng react-hook-form + Zod để validate

import * as React from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlusIcon } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { createAccountSchema, type CreateAccountFormValues } from '../accounts.schema';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountFormValues) => Promise<void>;
}

export function CreateAccountModal({ isOpen, onClose, onSubmit }: CreateAccountModalProps) {
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
    },
  });

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isSubmitting },
  } = form;

  // Reset form mỗi khi mở modal
  React.useEffect(() => {
    if (isOpen) {
      reset({
        fullname: '', username: '', mail: '', password: '',
        role: 'STAFF', status_account: 'ACTIVE',
      });
    }
  }, [isOpen, reset]);

  // Xử lý submit: gọi lên parent, nếu thành công thì đóng modal
  const handleFormSubmit = async (data: CreateAccountFormValues) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Lỗi đã được xử lý ở parent (toast)
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm tài khoản mới">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FieldGroup className="gap-3">
            {/* Họ và tên */}
            <Field>
              <FieldLabel htmlFor="create-fullname">Họ và tên</FieldLabel>
              <Input id="create-fullname" placeholder="Nhập họ và tên đầy đủ" {...register('fullname')} data-invalid={!!errors.fullname} />
              <FieldError errors={[errors.fullname]} />
            </Field>

            {/* Tên đăng nhập */}
            <Field>
              <FieldLabel htmlFor="create-username">Tên đăng nhập</FieldLabel>
              <Input id="create-username" placeholder="Nhập tên đăng nhập (ví dụ: nguyenvana)" {...register('username')} data-invalid={!!errors.username} />
              <FieldError errors={[errors.username]} />
            </Field>

            {/* Email */}
            <Field>
              <FieldLabel htmlFor="create-mail">Địa chỉ Email</FieldLabel>
              <Input id="create-mail" type="email" placeholder="Nhập địa chỉ email" {...register('mail')} data-invalid={!!errors.mail} />
              <FieldError errors={[errors.mail]} />
            </Field>

            {/* Mật khẩu */}
            <Field>
              <FieldLabel htmlFor="create-password">Mật khẩu</FieldLabel>
              <Input id="create-password" type="password" placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)" {...register('password')} data-invalid={!!errors.password} />
              <FieldError errors={[errors.password]} />
            </Field>

            {/* Vai trò (ADMIN / STAFF) */}
            <Field>
              <FieldLabel htmlFor="create-role">Vai trò</FieldLabel>
              <Controller name="role" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="create-role" className="w-full">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Nhân viên (STAFF)</SelectItem>
                    <SelectItem value="ADMIN">Quản trị viên (ADMIN)</SelectItem>
                  </SelectContent>
                </Select>
              )} />
              <FieldError errors={[errors.role]} />
            </Field>

            {/* Trạng thái (ACTIVE / INACTIVE / LOCKED) */}
            <Field>
              <FieldLabel htmlFor="create-status">Trạng thái</FieldLabel>
              <Controller name="status_account" control={control} render={({ field }) => (
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
              )} />
              <FieldError errors={[errors.status_account]} />
            </Field>
          </FieldGroup>

          {/* Nút Hủy / Thêm tài khoản */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}
              className="border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer">
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/10 cursor-pointer">
              <UserPlusIcon className="size-4 mr-2" />
              {isSubmitting ? 'Đang tạo...' : 'Thêm tài khoản'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
