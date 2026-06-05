'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, SaveIcon } from 'lucide-react';
import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import type { IBranch } from '@/lib/types/branch';
import { createBranchSchema, type CreateBranchFormValues } from '../branches.schema';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: IBranch | null; // Nếu null là tạo mới, khác null là cập nhật
  onSubmit: (data: CreateBranchFormValues) => Promise<void>;
}

export function BranchModal({ isOpen, onClose, branch, onSubmit }: BranchModalProps) {
  const isEdit = !!branch;

  const form = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      name: '',
      city: '',
      address: '',
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
      if (branch) {
        reset({
          name: branch.name,
          city: branch.city,
          address: branch.address ?? '',
        });
      } else {
        reset({
          name: '',
          city: '',
          address: '',
        });
      }
    }
  }, [isOpen, branch, reset]);

  const handleFormSubmit = async (data: CreateBranchFormValues) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Errors handled by caller
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Sửa thông tin chi nhánh' : 'Thêm chi nhánh mới'}
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="branch-name">Tên chi nhánh</FieldLabel>
              <Input
                id="branch-name"
                placeholder={
                  isEdit ? 'Nhập tên chi nhánh' : 'Nhập tên chi nhánh (ví dụ: Chi nhánh Quận 1)'
                }
                {...register('name')}
                data-invalid={!!errors.name}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="branch-city">Thành phố</FieldLabel>
              <Input
                id="branch-city"
                placeholder="Nhập thành phố"
                {...register('city')}
                data-invalid={!!errors.city}
              />
              <FieldError errors={[errors.city]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="branch-address">Địa chỉ chi tiết</FieldLabel>
              <Input
                id="branch-address"
                placeholder="Nhập địa chỉ chi tiết (ví dụ: 123 Đường Lê Lợi)"
                {...register('address')}
                data-invalid={!!errors.address}
              />
              <FieldError errors={[errors.address]} />
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
              {isEdit ? (
                <SaveIcon className="size-4 mr-2" />
              ) : (
                <PlusCircle className="size-4 mr-2" />
              )}
              {isSubmitting
                ? isEdit
                  ? 'Đang lưu...'
                  : 'Đang tạo...'
                : isEdit
                  ? 'Lưu thay đổi'
                  : 'Thêm chi nhánh'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
