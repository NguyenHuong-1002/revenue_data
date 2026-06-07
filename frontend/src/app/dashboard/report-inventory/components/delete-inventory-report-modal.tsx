'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface DeleteInventoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  reportId: string | null;
}

export function DeleteInventoryReportModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  reportId,
}: DeleteInventoryReportModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận xóa báo cáo tồn kho">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Bạn có chắc chắn muốn xóa báo cáo tồn kho{' '}
          <strong className="font-semibold text-foreground font-mono">{reportId}</strong>? Hành động
          này không thể hoàn tác và dữ liệu sẽ biến mất vĩnh viễn khỏi hệ thống.
        </p>
        <div className="flex justify-end gap-3 pt-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
