'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
import { Modal } from './modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { createBranchSchema, type CreateBranchFormValues } from '../branches.schema';

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBranchFormValues) => Promise<void>;
}

export function CreateBranchModal({ isOpen, onClose, onSubmit }: CreateBranchModalProps) {
  const form = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      name: '',
      city: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        city: '',
      });
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: CreateBranchFormValues) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Errors handled by caller
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm chi nhánh mới">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="create-branch-name">Tên chi nhánh</FieldLabel>
              <Input
                id="create-branch-name"
                placeholder="Nhập tên chi nhánh (ví dụ: Chi nhánh Quận 1)"
                {...register('name')}
                data-invalid={!!errors.name}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="create-branch-city">Thành phố</FieldLabel>
              <Input
                id="create-branch-city"
                placeholder="Nhập thành phố (ví dụ: Hồ Chí Minh)"
                {...register('city')}
                data-invalid={!!errors.city}
              />
              <FieldError errors={[errors.city]} />
            </Field>
          </FieldGroup>

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
              <PlusCircle className="size-4 mr-2" />
              {isSubmitting ? 'Đang tạo...' : 'Thêm chi nhánh'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
