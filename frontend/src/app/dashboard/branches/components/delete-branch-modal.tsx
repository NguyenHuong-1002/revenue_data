'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface DeleteBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DeleteBranchModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: DeleteBranchModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa chi nhánh">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bạn có chắc chắn muốn xóa chi nhánh này? Hành động này sẽ xóa hoàn toàn thông tin chi
          nhánh khỏi cơ sở dữ liệu và không thể khôi phục lại.
        </p>
        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/95 text-white font-medium shadow-lg hover:shadow-destructive/10 cursor-pointer"
          >
            {isLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
