'use client';

// ===== Modal xác nhận xóa tài khoản =====
// Hiển thị cảnh báo trước khi xóa, có nút Hủy và Xác nhận
// isLoading để disable nút khi đang gọi API

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface DeleteAccountModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountModal({ isOpen, isLoading, onClose, onConfirm }: DeleteAccountModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa tài khoản" variant="danger">
      <div className="space-y-4">
        {/* Nội dung cảnh báo */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này? Hành động này sẽ hủy bỏ mọi quyền
          truy cập của tài khoản này vào hệ thống và không thể khôi phục lại.
        </p>

        {/* Nút Hủy / Xác nhận */}
        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button" variant="outline"
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
