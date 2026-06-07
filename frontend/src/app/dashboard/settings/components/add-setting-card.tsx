'use client';

import { X, Check } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface NewSettingState {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  group: string;
  description: string;
}

interface AddSettingCardProps {
  isOpen: boolean;
  newSetting: NewSettingState;
  onNewSettingChange: (setting: NewSettingState) => void;
  onCancel: () => void;
  onCreate: () => void;
}

export function AddSettingCard({
  isOpen,
  newSetting,
  onNewSettingChange,
  onCancel,
  onCreate,
}: AddSettingCardProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Thêm cài đặt mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Key *</label>
              <Input
                placeholder="Ví dụ: MAX_LOGIN_ATTEMPTS"
                value={newSetting.key}
                onChange={(e) => onNewSettingChange({ ...newSetting, key: e.target.value })}
                className="h-9 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Value *</label>
              <Input
                placeholder="Giá trị cấu hình"
                value={newSetting.value}
                onChange={(e) => onNewSettingChange({ ...newSetting, value: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Kiểu dữ liệu</label>
              <select
                value={newSetting.type}
                onChange={(e) =>
                  onNewSettingChange({
                    ...newSetting,
                    type: e.target.value as 'string' | 'number' | 'boolean' | 'json',
                  })
                }
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="string">String (Chuỗi)</option>
                <option value="number">Number (Số)</option>
                <option value="boolean">Boolean (Đúng/Sai)</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Nhóm cài đặt</label>
              <select
                value={newSetting.group}
                onChange={(e) => onNewSettingChange({ ...newSetting, group: e.target.value })}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="general">Chung (General)</option>
                <option value="notification">Thông báo (Notification)</option>
                <option value="security">Bảo mật (Security)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Mô tả ngắn</label>
            <Input
              placeholder="Giải thích ngắn gọn ý nghĩa của cài đặt..."
              value={newSetting.description}
              onChange={(e) => onNewSettingChange({ ...newSetting, description: e.target.value })}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="cursor-pointer">
            <X className="size-3.5 mr-1" /> Huỷ
          </Button>
          <Button
            size="sm"
            onClick={onCreate}
            className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
          >
            <Check className="size-3.5 mr-1" /> Tạo cài đặt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
