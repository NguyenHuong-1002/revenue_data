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
import { editSaleReportSchema, type EditSaleReportFormValues } from '../report-sale.schema';
import { productService } from '@/lib/services/product.service';
import { branchService } from '@/lib/services/branch.service';
import { Loader2 } from 'lucide-react';
import type { IProduct } from '@/lib/types/product';
import type { IBranch } from '@/lib/types/branch';
import type { ISaleReport } from '@/lib/services/sale-report.service';

interface EditSaleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditSaleReportFormValues) => Promise<void>;
  report: ISaleReport | null;
}

export function EditSaleReportModal({ isOpen, onClose, onSubmit, report }: EditSaleReportModalProps) {
  const [products, setProducts] = React.useState<IProduct[]>([]);
  const [branches, setBranches] = React.useState<IBranch[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = React.useState(false);

  const form = useForm<EditSaleReportFormValues>({
    resolver: zodResolver(editSaleReportSchema),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // Load products and branches for dropdowns
  React.useEffect(() => {
    if (isOpen && report) {
      setIsLoadingDropdowns(true);
      Promise.all([
        productService.list({ limit: 200 }),
        branchService.list({ limit: 100 }),
      ])
        .then(([prodRes, branchRes]) => {
          setProducts(prodRes.data.data || []);
          setBranches(branchRes.data.data || []);
        })
        .catch(() => {})
        .finally(() => setIsLoadingDropdowns(false));

      reset({
        product_id: report.product_id,
        customer_id: report.customer_id,
        sold_quantity: report.sold_quantity,
        distribution_channel: report.distribution_channel,
        branch_id: report.branch_id,
        time_report: report.time_report.slice(0, 10),
      });
    }
  }, [isOpen, report, reset]);

  const handleFormSubmit = async (data: EditSaleReportFormValues) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Handled by caller
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cập nhật báo cáo doanh số">
      {isLoadingDropdowns ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FieldGroup className="gap-3">
              {/* Chọn sản phẩm */}
              <Field>
                <FieldLabel htmlFor="edit-sale-product">Sản phẩm</FieldLabel>
                <Controller
                  name="product_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="edit-sale-product" className="w-full">
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

              {/* Chọn chi nhánh */}
              <Field>
                <FieldLabel htmlFor="edit-sale-branch">Chi nhánh</FieldLabel>
                <Controller
                  name="branch_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="edit-sale-branch" className="w-full">
                        <SelectValue placeholder="Chọn chi nhánh" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {branches.map((b) => (
                          <SelectItem key={b.store_id} value={b.store_id}>
                            {b.name} ({b.store_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.branch_id]} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                {/* Mã khách hàng */}
                <Field>
                  <FieldLabel htmlFor="edit-sale-customer">Mã khách hàng</FieldLabel>
                  <Input
                    id="edit-sale-customer"
                    placeholder="Ví dụ: CUS-1001"
                    {...register('customer_id')}
                    data-invalid={!!errors.customer_id}
                  />
                  <FieldError errors={[errors.customer_id]} />
                </Field>

                {/* Số lượng */}
                <Field>
                  <FieldLabel htmlFor="edit-sale-qty">Số lượng bán</FieldLabel>
                  <Input
                    id="edit-sale-qty"
                    type="number"
                    {...register('sold_quantity', { valueAsNumber: true })}
                    data-invalid={!!errors.sold_quantity}
                  />
                  <FieldError errors={[errors.sold_quantity]} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Kênh phân phối */}
                <Field>
                  <FieldLabel htmlFor="edit-sale-channel">Kênh phân phối</FieldLabel>
                  <Controller
                    name="distribution_channel"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="edit-sale-channel" className="w-full">
                          <SelectValue placeholder="Chọn kênh" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="Online">Online</SelectItem>
                          <SelectItem value="Bán lẻ">Bán lẻ</SelectItem>
                          <SelectItem value="Phát sinh">Phát sinh</SelectItem>
                          <SelectItem value="Bán sỉ">Bán sỉ</SelectItem>
                          <SelectItem value="Siêu thị">Siêu thị</SelectItem>
                          <SelectItem value="Hợp đồng">Hợp đồng</SelectItem>
                          <SelectItem value="Chi nhánh">Chi nhánh</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.distribution_channel]} />
                </Field>

                {/* Thời gian */}
                <Field>
                  <FieldLabel htmlFor="edit-sale-time">Thời gian</FieldLabel>
                  <Input
                    id="edit-sale-time"
                    type="date"
                    {...register('time_report')}
                    data-invalid={!!errors.time_report}
                  />
                  <FieldError errors={[errors.time_report]} />
                </Field>
              </div>
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-5">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Cập nhật'
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
