'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, SaveIcon } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { createPlantSchema, type CreatePlantFormValues } from '../plants.schema';
import type { IPlant } from '@/lib/types/plant';

interface PlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  plant: IPlant | null; // Nếu null là tạo mới, khác null là cập nhật
  onSubmit: (data: CreatePlantFormValues) => Promise<void>;
}

export function PlantModal({ isOpen, onClose, plant, onSubmit }: PlantModalProps) {
  const isEdit = !!plant;

  const form = useForm<CreatePlantFormValues>({
    resolver: zodResolver(createPlantSchema),
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
    if (isOpen) {
      if (plant) {
        reset({
          name_plant: plant.name_plant,
          address: plant.address,
          manager_name: plant.manager_name,
          phone: plant.phone,
        });
      } else {
        reset({
          name_plant: '',
          address: '',
          manager_name: '',
          phone: '',
        });
      }
    }
  }, [isOpen, plant, reset]);

  const handleFormSubmit = async (data: CreatePlantFormValues) => {
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
      title={isEdit ? 'Sửa thông tin nhà kho' : 'Thêm nhà kho mới'}
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="plant-name">Tên nhà kho</FieldLabel>
              <Input
                id="plant-name"
                placeholder={isEdit ? 'Nhập tên nhà kho' : 'Nhập tên nhà kho (ví dụ: Kho miền Nam)'}
                {...register('name_plant')}
                data-invalid={!!errors.name_plant}
              />
              <FieldError errors={[errors.name_plant]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="plant-address">Địa chỉ</FieldLabel>
              <Input
                id="plant-address"
                placeholder="Nhập địa chỉ nhà kho"
                {...register('address')}
                data-invalid={!!errors.address}
              />
              <FieldError errors={[errors.address]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="plant-manager">Người quản lý</FieldLabel>
              <Input
                id="plant-manager"
                placeholder="Nhập tên người quản lý"
                {...register('manager_name')}
                data-invalid={!!errors.manager_name}
              />
              <FieldError errors={[errors.manager_name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="plant-phone">Số điện thoại</FieldLabel>
              <Input
                id="plant-phone"
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
                  : 'Thêm nhà kho'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
