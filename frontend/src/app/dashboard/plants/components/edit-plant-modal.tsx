'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveIcon } from 'lucide-react';
import { Modal } from './modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { editPlantSchema, type EditPlantFormValues } from '../plants.schema';
import type { IPlant } from '@/lib/types/plant';

interface EditPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  plant: IPlant | null;
  onSubmit: (data: EditPlantFormValues) => Promise<void>;
}

export function EditPlantModal({ isOpen, onClose, plant, onSubmit }: EditPlantModalProps) {
  const form = useForm<EditPlantFormValues>({
    resolver: zodResolver(editPlantSchema),
    defaultValues: {
      name_plant: '',
      address: '',
      manager_name: '',
      phone: '',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  React.useEffect(() => {
    if (isOpen && plant) {
      reset({
        name_plant: plant.name_plant,
        address: plant.address,
        manager_name: plant.manager_name,
        phone: plant.phone,
      });
    }
  }, [isOpen, plant, reset]);

  const handleFormSubmit = async (data: EditPlantFormValues) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Errors handled by caller
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sửa thông tin nhà kho">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="edit-plant-name">Tên nhà kho</FieldLabel>
              <Input
                id="edit-plant-name"
                placeholder="Nhập tên nhà kho"
                {...register('name_plant')}
                data-invalid={!!errors.name_plant}
              />
              <FieldError errors={[errors.name_plant]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="edit-plant-address">Địa chỉ</FieldLabel>
              <Input
                id="edit-plant-address"
                placeholder="Nhập địa chỉ nhà kho"
                {...register('address')}
                data-invalid={!!errors.address}
              />
              <FieldError errors={[errors.address]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="edit-plant-manager">Người quản lý</FieldLabel>
              <Input
                id="edit-plant-manager"
                placeholder="Nhập tên người quản lý"
                {...register('manager_name')}
                data-invalid={!!errors.manager_name}
              />
              <FieldError errors={[errors.manager_name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="edit-plant-phone">Số điện thoại</FieldLabel>
              <Input
                id="edit-plant-phone"
                placeholder="Nhập số điện thoại"
                {...register('phone')}
                data-invalid={!!errors.phone}
              />
              <FieldError errors={[errors.phone]} />
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
