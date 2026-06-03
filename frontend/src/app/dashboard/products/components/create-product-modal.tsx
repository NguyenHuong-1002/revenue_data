'use client';

import * as React from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
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
import { createProductSchema, type CreateProductFormValues } from '../products.schema';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductFormValues) => Promise<void>;
}

export function CreateProductModal({ isOpen, onClose, onSubmit }: CreateProductModalProps) {
  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      color: '',
      listing_price: 0,
      price_cost: 0,
      gender: 'Nam',
      detail_product_group: 'SANTD',
      size: 38,
      age_group: '24 đến <40 tuổi',
      activity_group: 'Thường nhật/Trường học',
      lifestyle_group: 'Casual',
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  React.useEffect(() => {
    if (isOpen) {
      reset({
        color: '',
        listing_price: 0,
        price_cost: 0,
        gender: 'Nam',
        detail_product_group: 'SANTD',
        size: 38,
        age_group: '24 đến <40 tuổi',
        activity_group: 'Thường nhật/Trường học',
        lifestyle_group: 'Casual',
      });
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: CreateProductFormValues) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Handled by caller
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm sản phẩm mới">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FieldGroup className="gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="create-product-color">Màu sắc</FieldLabel>
                <Input
                  id="create-product-color"
                  placeholder="Ví dụ: Đen, Trắng, Xanh..."
                  {...register('color')}
                  data-invalid={!!errors.color}
                />
                <FieldError errors={[errors.color]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="create-product-size">Kích cỡ (Size)</FieldLabel>
                <Input
                  id="create-product-size"
                  type="number"
                  placeholder="Ví dụ: 38, 39, 40..."
                  {...register('size', { valueAsNumber: true })}
                  data-invalid={!!errors.size}
                />
                <FieldError errors={[errors.size]} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="create-product-price-cost">Giá vốn (VNĐ)</FieldLabel>
                <Input
                  id="create-product-price-cost"
                  type="number"
                  placeholder="Nhập giá vốn nhập hàng"
                  {...register('price_cost', { valueAsNumber: true })}
                  data-invalid={!!errors.price_cost}
                />
                <FieldError errors={[errors.price_cost]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="create-product-listing-price">Giá bán lẻ (VNĐ)</FieldLabel>
                <Input
                  id="create-product-listing-price"
                  type="number"
                  placeholder="Nhập giá bán niêm yết"
                  {...register('listing_price', { valueAsNumber: true })}
                  data-invalid={!!errors.listing_price}
                />
                <FieldError errors={[errors.listing_price]} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="create-product-gender">Giới tính</FieldLabel>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="create-product-gender" className="w-full">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="Nam">Nam (MEN)</SelectItem>
                        <SelectItem value="Nữ">Nữ (WOM)</SelectItem>
                        <SelectItem value="Bé trai">Bé trai (BOY)</SelectItem>
                        <SelectItem value="Bé gái">Bé gái (GIR)</SelectItem>
                        <SelectItem value="Unisex">Unisex</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.gender]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="create-product-detail-group">
                  Nhóm chi tiết sản phẩm
                </FieldLabel>
                <Controller
                  name="detail_product_group"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="create-product-detail-group" className="w-full">
                        <SelectValue placeholder="Chọn nhóm" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="SANTD">SANTD</SelectItem>
                        <SelectItem value="DEPTD">DEPTD</SelectItem>
                        <SelectItem value="GTTPC">GTTPC</SelectItem>
                        <SelectItem value="GTTCD">GTTCD</SelectItem>
                        <SelectItem value="SANTR">SANTR</SelectItem>
                        <SelectItem value="GIATR">GIATR</SelectItem>
                        <SelectItem value="PKIEN">PKIEN</SelectItem>
                        <SelectItem value="TBLTH">TBLTH</SelectItem>
                        <SelectItem value="TBLTR">TBLTR</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.detail_product_group]} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="create-product-age-group">Nhóm độ tuổi</FieldLabel>
              <Controller
                name="age_group"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="create-product-age-group" className="w-full">
                      <SelectValue placeholder="Chọn độ tuổi" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="0 đến <3 tuổi">0 đến &lt;3 tuổi</SelectItem>
                      <SelectItem value="3 đến <6 tuổi">3 đến &lt;6 tuổi</SelectItem>
                      <SelectItem value="6 đến <10 tuổi">6 đến &lt;10 tuổi</SelectItem>
                      <SelectItem value="10 đến <16 tuổi">10 đến &lt;16 tuổi</SelectItem>
                      <SelectItem value="16 đến <24 tuổi">16 đến &lt;24 tuổi</SelectItem>
                      <SelectItem value="24 đến <40 tuổi">24 đến &lt;40 tuổi</SelectItem>
                      <SelectItem value="40 đến <60 tuổi">40 đến &lt;60 tuổi</SelectItem>
                      <SelectItem value="Trên 60 tuổi">Trên 60 tuổi</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.age_group]} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="create-product-activity-group">Nhóm hoạt động</FieldLabel>
                <Controller
                  name="activity_group"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="create-product-activity-group" className="w-full">
                        <SelectValue placeholder="Chọn hoạt động" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="Thường nhật/Trường học">
                          Thường nhật/Trường học
                        </SelectItem>
                        <SelectItem value="Thể thao">Thể thao</SelectItem>
                        <SelectItem value="Văn phòng">Văn phòng</SelectItem>
                        <SelectItem value="Chuyên biệt">Chuyên biệt</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.activity_group]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="create-product-lifestyle-group">
                  Nhóm phong cách sống
                </FieldLabel>
                <Controller
                  name="lifestyle_group"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="create-product-lifestyle-group" className="w-full">
                        <SelectValue placeholder="Chọn phong cách" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="Sport">Sport</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Formal">Formal</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.lifestyle_group]} />
              </Field>
            </div>
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
              {isSubmitting ? 'Đang tạo...' : 'Thêm sản phẩm'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
