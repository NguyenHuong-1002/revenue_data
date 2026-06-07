'use client';

import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  productId: string | null;
}

export function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  productId,
}: DeleteProductModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa sản phẩm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
          <ShieldAlert className="size-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Hành động này không thể hoàn tác!</p>
            <p className="text-xs text-red-400 mt-1">
              Bạn có chắc chắn muốn xóa sản phẩm có mã <strong>{productId}</strong> khỏi hệ thống?
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-500 text-white font-medium shadow-lg hover:shadow-red-500/10 cursor-pointer"
          >
            {isLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
