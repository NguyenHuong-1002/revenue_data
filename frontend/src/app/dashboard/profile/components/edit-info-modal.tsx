'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveIcon } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { infoSchema, type InfoFormValues } from '../profile.schema';

interface EditInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues: InfoFormValues;
  onSubmit: (data: InfoFormValues) => Promise<void>;
}

export function EditInfoModal({ isOpen, onClose, defaultValues, onSubmit }: EditInfoModalProps) {
  const form = useForm<InfoFormValues>({
    resolver: zodResolver(infoSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  React.useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, defaultValues, reset]);

  const handleFormSubmit = async (data: InfoFormValues) => {
    await onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa thông tin">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="fullname">Họ và tên</FieldLabel>
              <Input
                id="fullname"
                placeholder="Nhập họ và tên đầy đủ"
                {...register('fullname')}
                data-invalid={!!errors.fullname}
              />
              <FieldError errors={[errors.fullname]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="username">Tên đăng nhập</FieldLabel>
              <Input
                id="username"
                placeholder="Nhập tên đăng nhập"
                {...register('username')}
                data-invalid={!!errors.username}
              />
              <FieldError errors={[errors.username]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="mail">Địa chỉ Email (Chỉ xem)</FieldLabel>
              <Input
                id="mail"
                type="email"
                placeholder="Nhập địa chỉ email"
                disabled
                className="bg-muted border-border opacity-70 cursor-not-allowed text-zinc-400"
                {...register('mail')}
              />
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
              <SaveIcon className="size-4 mr-2" />
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
