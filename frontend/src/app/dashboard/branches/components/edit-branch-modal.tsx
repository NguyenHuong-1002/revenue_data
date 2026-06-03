'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveIcon } from 'lucide-react';
import { Modal } from './modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { editBranchSchema, type EditBranchFormValues } from '../branches.schema';
import type { IBranch } from '@/lib/types/branch';

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: IBranch | null;
  onSubmit: (data: EditBranchFormValues) => Promise<void>;
}

export function EditBranchModal({ isOpen, onClose, branch, onSubmit }: EditBranchModalProps) {
  const form = useForm<EditBranchFormValues>({
    resolver: zodResolver(editBranchSchema),
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
    if (isOpen && branch) {
      reset({
        name: branch.name,
        city: branch.city,
      });
    }
  }, [isOpen, branch, reset]);

  const handleFormSubmit = async (data: EditBranchFormValues) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Errors handled by caller
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sửa thông tin chi nhánh">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="edit-branch-name">Tên chi nhánh</FieldLabel>
              <Input
                id="edit-branch-name"
                placeholder="Nhập tên chi nhánh"
                {...register('name')}
                data-invalid={!!errors.name}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="edit-branch-city">Thành phố</FieldLabel>
              <Input
                id="edit-branch-city"
                placeholder="Nhập thành phố"
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
              <SaveIcon className="size-4 mr-2" />
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
