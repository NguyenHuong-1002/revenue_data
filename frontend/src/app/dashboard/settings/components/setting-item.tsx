'use client';

import { Save, Trash2, Loader2 } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ISystemSetting } from '@/lib/types/settings';

const TYPE_LABELS: Record<string, string> = {
  string: 'Chuỗi',
  number: 'Số',
  boolean: 'Boolean',
  json: 'JSON',
};

interface SettingItemProps {
  setting: ISystemSetting;
  value: string;
  isSaving: boolean;
  onValueChange: (val: string) => void;
  onSave: () => void;
  onDelete: () => void;
}

export function SettingItem({
  setting,
  value,
  isSaving,
  onValueChange,
  onSave,
  onDelete,
}: SettingItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/5 transition-colors">
      <div className="space-y-1 max-w-xl flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <code className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded">
            {setting.key}
          </code>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
            {TYPE_LABELS[setting.type] || setting.type}
          </span>
        </div>
        {setting.description && (
          <p className="text-xs text-muted-foreground">{setting.description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
        <div className="flex-1 sm:flex-none">
          {setting.type === 'boolean' ? (
            <select
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              className="flex h-9 w-full sm:w-36 rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="true">Bật (True)</option>
              <option value="false">Tắt (False)</option>
            </select>
          ) : (
            <Input
              type={setting.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              className="w-full sm:w-48 text-xs font-mono h-9"
            />
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 text-emerald-600 hover:text-white hover:bg-emerald-600 border-emerald-500/20 cursor-pointer"
            onClick={onSave}
            disabled={isSaving}
            title="Lưu cấu hình"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 text-destructive hover:text-white hover:bg-destructive border-destructive/20 cursor-pointer"
            onClick={onDelete}
            title="Xoá cài đặt"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
