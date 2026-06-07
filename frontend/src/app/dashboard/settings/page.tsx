'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { Globe, Bell, Shield, Settings2, Plus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard-header';
import { settingsService } from '@/lib/services/settings.service';
import type { ISystemSettingGroup } from '@/lib/types/settings';
import { cn } from '@/lib/utils';
import { AddSettingCard } from './components/add-setting-card';
import { SettingItem } from './components/setting-item';
import { SettingsSkeleton } from './components/settings-skeleton';

const GROUP_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  general: { label: 'Chung', icon: <Globe className="size-4" /> },
  notification: { label: 'Thông báo', icon: <Bell className="size-4" /> },
  security: { label: 'Bảo mật', icon: <Shield className="size-4" /> },
};

export default function SettingsPage() {
  const [groups, setGroups] = useState<ISystemSettingGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('general');
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSetting, setNewSetting] = useState<{
    key: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    group: string;
    description: string;
  }>({
    key: '',
    value: '',
    type: 'string',
    group: 'general',
    description: '',
  });

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await settingsService.getAll();
      setGroups(res.data);
      const vals: Record<string, string> = {};
      for (const g of res.data) {
        for (const s of g.settings) {
          vals[s.key] = s.value;
        }
      }
      setEditingValues(vals);
    } catch {
      toast.error('Không thể tải cài đặt hệ thống.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (key: string) => {
    setSavingKeys((prev) => new Set(prev).add(key));
    try {
      await settingsService.update(key, { value: editingValues[key] });
      toast.success(`Đã lưu cài đặt "${key}"`);
    } catch {
      toast.error(`Không thể lưu cài đặt "${key}"`);
    } finally {
      setSavingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleCreate = async () => {
    if (!newSetting.key.trim() || !newSetting.value.trim()) {
      toast.error('Key và Value không được để trống');
      return;
    }
    try {
      await settingsService.create(newSetting);
      toast.success('Đã thêm cài đặt mới');
      setIsAddingNew(false);
      setNewSetting({ key: '', value: '', type: 'string', group: 'general', description: '' });
      fetchSettings();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Không thể tạo cài đặt');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Xác nhận xoá cài đặt "${key}"?`)) return;
    try {
      await settingsService.delete(key);
      toast.success(`Đã xoá cài đặt "${key}"`);
      fetchSettings();
    } catch {
      toast.error(`Không thể xoá cài đặt "${key}"`);
    }
  };

  const activeGroup = groups.find((g) => g.group === activeTab);

  return (
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-7xl mx-auto w-full">
      <DashboardHeader
        title="Cài đặt hệ thống"
        description="Quản lý các cấu hình chung cho toàn bộ hệ thống."
        icon={Settings2}
      >
        <Button
          onClick={() => setIsAddingNew(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
        >
          <Plus className="size-4 mr-2" />
          Thêm cài đặt
        </Button>
      </DashboardHeader>

      {isLoading ? (
        <SettingsSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Add settings modal */}
          <AddSettingCard
            isOpen={isAddingNew}
            newSetting={newSetting}
            onNewSettingChange={setNewSetting}
            onCancel={() => setIsAddingNew(false)}
            onCreate={handleCreate}
          />

          {/* Group tabs selector */}
          <div className="flex border-b border-border gap-2 overflow-x-auto select-none">
            {groups.map((group) => {
              const info = GROUP_LABELS[group.group] || {
                label: group.group,
                icon: <Settings2 className="size-4" />,
              };
              return (
                <button
                  key={group.group}
                  onClick={() => setActiveTab(group.group)}
                  className={cn(
                    'pb-3 text-sm font-semibold relative transition-all px-4 py-2 flex items-center gap-2 cursor-pointer outline-none border-b-2',
                    activeTab === group.group
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {info.icon}
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings list under active group */}
          <div className="space-y-4">
            {!activeGroup || activeGroup.settings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-card border border-border/50 rounded-xl">
                <Settings2 className="size-10 text-muted-foreground opacity-30 animate-pulse" />
                <p className="text-foreground font-semibold text-sm">
                  Không có cài đặt nào trong nhóm này
                </p>
              </div>
            ) : (
              activeGroup.settings.map((setting) => (
                <SettingItem
                  key={setting.key}
                  setting={setting}
                  value={editingValues[setting.key] ?? ''}
                  isSaving={savingKeys.has(setting.key)}
                  onValueChange={(val) =>
                    setEditingValues((prev) => ({ ...prev, [setting.key]: val }))
                  }
                  onSave={() => handleSave(setting.key)}
                  onDelete={() => handleDelete(setting.key)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
