'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon, KeyIcon } from 'lucide-react';
import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { passwordChangeSchema, type PasswordChangeFormValues } from '../profile.schema';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PasswordChangeFormValues) => Promise<void>;
}

export function ChangePasswordModal({ isOpen, onClose, onSubmit }: ChangePasswordModalProps) {
  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      reset({
        currentPassword: '',
        password: '',
        confirmPassword: '',
      });
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: PasswordChangeFormValues) => {
    await onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đổi mật khẩu">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="currentPassword">Mật khẩu hiện tại</FieldLabel>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="pr-10"
                  {...register('currentPassword')}
                  data-invalid={!!errors.currentPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showCurrent ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
              <FieldError errors={[errors.currentPassword]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Mật khẩu mới</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  className="pr-10"
                  {...register('password')}
                  data-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
              <FieldError errors={[errors.password]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu mới</FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Xác nhận lại mật khẩu mới"
                  className="pr-10"
                  {...register('confirmPassword')}
                  data-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
              <FieldError errors={[errors.confirmPassword]} />
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
              className="border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              <KeyIcon className="size-4 mr-2" />
              {isSubmitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
