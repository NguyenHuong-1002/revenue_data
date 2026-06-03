'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Settings2,
  Shield,
  Bell,
  Globe,
  ChevronDown,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { settingsService } from '@/lib/services/settings.service';
import type { ISystemSettingGroup, ISystemSetting } from '@/lib/types/settings';

const GROUP_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  general: { label: 'Chung', icon: <Globe className="size-4" /> },
  notification: { label: 'Thông báo', icon: <Bell className="size-4" /> },
  security: { label: 'Bảo mật', icon: <Shield className="size-4" /> },
};

const TYPE_LABELS: Record<string, string> = {
  string: 'Chuỗi ký tự',
  number: 'Số',
  boolean: 'Boolean',
  json: 'JSON',
};

export default function SettingsPage() {
  const [groups, setGroups] = useState<ISystemSettingGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['general']));
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    type: 'string' as const,
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

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

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
    } catch (err: any) {
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

  const getGroupIcon = (group: string) =>
    GROUP_LABELS[group]?.icon || <Settings2 className="size-4" />;
  const getGroupLabel = (group: string) => GROUP_LABELS[group]?.label || group;

  return (
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Cài đặt hệ thống</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý các cấu hình chung cho toàn bộ hệ thống.
          </p>
        </div>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
        >
          <Plus className="size-4 mr-2" />
          Thêm cài đặt
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-sm text-muted-foreground">Đang tải cài đặt...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {isAddingNew && (
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="p-5">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Key *
                    </label>
                    <Input
                      placeholder="Ví dụ: MAX_LOGIN_ATTEMPTS"
                      value={newSetting.key}
                      onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Value *
                    </label>
                    <Input
                      placeholder="Giá trị"
                      value={newSetting.value}
                      onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Type
                    </label>
                    <select
                      value={newSetting.type}
                      onChange={(e) =>
                        setNewSetting({ ...newSetting, type: e.target.value as any })
                      }
                      className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Group
                    </label>
                    <select
                      value={newSetting.group}
                      onChange={(e) => setNewSetting({ ...newSetting, group: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="general">general</option>
                      <option value="notification">notification</option>
                      <option value="security">security</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Mô tả
                  </label>
                  <Input
                    placeholder="Mô tả ngắn về cài đặt này"
                    value={newSetting.description}
                    onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingNew(false)}
                    className="cursor-pointer"
                  >
                    <X className="size-3.5 mr-1" /> Huỷ
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                  >
                    <Check className="size-3.5 mr-1" /> Tạo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border rounded-xl">
              <Settings2 className="size-12 text-muted-foreground opacity-40" />
              <p className="text-foreground font-semibold">Chưa có cài đặt nào</p>
              <p className="text-muted-foreground text-sm">Nhấn "Thêm cài đặt" để bắt đầu.</p>
            </div>
          ) : (
            groups.map((group) => (
              <Card key={group.group} className="border-border bg-card shadow-sm">
                <CardHeader
                  className="cursor-pointer select-none py-4 px-6 flex flex-row items-center justify-between"
                  onClick={() => toggleGroup(group.group)}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground">
                      {getGroupIcon(group.group)}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {getGroupLabel(group.group)}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {group.settings.length} cài đặt
                      </CardDescription>
                    </div>
                  </div>
                  {expandedGroups.has(group.group) ? (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  )}
                </CardHeader>

                {expandedGroups.has(group.group) && (
                  <CardContent className="px-6 pb-6 pt-0 space-y-4">
                    {group.settings.map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/10"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono font-semibold bg-muted/30 px-1.5 py-0.5 rounded text-foreground">
                              {setting.key}
                            </code>
                            <span className="text-[10px] text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded-full">
                              {TYPE_LABELS[setting.type] || setting.type}
                            </span>
                          </div>
                          {setting.description && (
                            <p className="text-xs text-muted-foreground">{setting.description}</p>
                          )}
                          <Input
                            value={editingValues[setting.key] ?? ''}
                            onChange={(e) =>
                              setEditingValues((prev) => ({
                                ...prev,
                                [setting.key]: e.target.value,
                              }))
                            }
                            className="mt-2 text-sm font-mono bg-background border-border"
                          />
                        </div>
                        <div className="flex items-center gap-1 shrink-0 pt-6">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-green-500 cursor-pointer"
                            onClick={() => handleSave(setting.key)}
                            disabled={savingKeys.has(setting.key)}
                            title="Lưu"
                          >
                            {savingKeys.has(setting.key) ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Save className="size-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                            onClick={() => handleDelete(setting.key)}
                            title="Xoá"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
