'use client';

import * as React from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from './modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createInventoryReportSchema, type CreateInventoryReportFormValues } from '../report-inventory.schema';
import { productService } from '@/lib/services/product.service';
import { plantService } from '@/lib/services/plant.service';
import { Loader2 } from 'lucide-react';
import type { IProduct } from '@/lib/types/product';
import type { IPlant } from '@/lib/types/plant';

interface CreateInventoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInventoryReportFormValues) => Promise<void>;
}

export function CreateInventoryReportModal({ isOpen, onClose, onSubmit }: CreateInventoryReportModalProps) {
  const [products, setProducts] = React.useState<IProduct[]>([]);
  const [plants, setPlants] = React.useState<IPlant[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = React.useState(false);

  const form = useForm<CreateInventoryReportFormValues>({
    resolver: zodResolver(createInventoryReportSchema),
    defaultValues: {
      product_id: '',
      plant_id: '',
      calendar_year_week: new Date().toISOString().slice(0, 10),
      quantity: 0,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // Load products and plants for dropdowns
  React.useEffect(() => {
    if (isOpen) {
      setIsLoadingDropdowns(true);
      Promise.all([
        productService.list({ limit: 200 }),
        plantService.list({ limit: 100 }),
      ])
        .then(([prodRes, plantRes]) => {
          setProducts(prodRes.data.data || []);
          setPlants(plantRes.data.data || []);
        })
        .catch(() => {})
        .finally(() => setIsLoadingDropdowns(false));

      reset({
        product_id: '',
        plant_id: '',
        calendar_year_week: new Date().toISOString().slice(0, 10),
        quantity: 0,
      });
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: CreateInventoryReportFormValues) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Handled by caller
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm báo cáo tồn kho">
      {isLoadingDropdowns ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FieldGroup className="gap-3">
              {/* Chọn sản phẩm */}
              <Field>
                <FieldLabel htmlFor="create-inv-product">Sản phẩm</FieldLabel>
                <Controller
                  name="product_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="create-inv-product" className="w-full">
                        <SelectValue placeholder="Chọn sản phẩm" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {products.map((p) => (
                          <SelectItem key={p.product_id} value={p.product_id}>
                            {p.product_id} (Màu: {p.color}, Size: {p.size})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.product_id]} />
              </Field>

              {/* Chọn nhà máy */}
              <Field>
                <FieldLabel htmlFor="create-inv-plant">Nhà máy sản xuất</FieldLabel>
                <Controller
                  name="plant_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="create-inv-plant" className="w-full">
                        <SelectValue placeholder="Chọn nhà máy" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {plants.map((pl) => (
                          <SelectItem key={pl.plant_id} value={pl.plant_id}>
                            {pl.name} ({pl.plant_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.plant_id]} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                {/* Số lượng */}
                <Field>
                  <FieldLabel htmlFor="create-inv-qty">Số lượng tồn kho</FieldLabel>
                  <Input
                    id="create-inv-qty"
                    type="number"
                    {...register('quantity', { valueAsNumber: true })}
                    data-invalid={!!errors.quantity}
                  />
                  <FieldError errors={[errors.quantity]} />
                </Field>

                {/* Thời gian */}
                <Field>
                  <FieldLabel htmlFor="create-inv-time">Thời gian (Tuần)</FieldLabel>
                  <Input
                    id="create-inv-time"
                    type="date"
                    {...register('calendar_year_week')}
                    data-invalid={!!errors.calendar_year_week}
                  />
                  <FieldError errors={[errors.calendar_year_week]} />
                </Field>
              </div>
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-5">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Thêm mới'
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
