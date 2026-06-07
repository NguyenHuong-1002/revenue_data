'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { landingService, FeatureItem } from '@/lib/services/landing.service';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { LandingSkeleton } from './landing-skeleton';
import { toast } from 'sonner';
import { IconRenderer, AVAILABLE_ICONS } from './icon-renderer';

export function FeaturesTab() {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [featureForm, setFeatureForm] = useState<Partial<FeatureItem>>({
    icon: 'DatabaseIcon',
    title: '',
    description: '',
  });

  const loadFeatures = async () => {
    setIsLoading(true);
    try {
      const data = await landingService.getFeatures();
      setFeatures(data);
    } catch (err) {
      console.error('Failed to fetch features:', err);
      toast.error('Không thể tải danh sách tính năng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const handleSaveFeature = async () => {
    if (!featureForm.title || !featureForm.description) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và mô tả');
      return;
    }
    try {
      if (editingId) {
        await landingService.updateFeature(editingId, featureForm);
        toast.success('Cập nhật tính năng thành công');
      } else {
        await landingService.createFeature(featureForm);
        toast.success('Thêm tính năng mới thành công');
      }
      setIsEditing(false);
      setEditingId(null);
      setFeatureForm({ icon: 'DatabaseIcon', title: '', description: '' });
      loadFeatures();
    } catch (err) {
      toast.error('Lỗi khi lưu tính năng');
    }
  };

  const startEditFeature = (item: FeatureItem) => {
    setFeatureForm({ icon: item.icon, title: item.title, description: item.description });
    setEditingId(item.id!);
    setIsEditing(true);
  };

  const handleDeleteFeature = async (id: number) => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Bạn có chắc chắn muốn xóa tính năng này?')
    ) {
      try {
        await landingService.deleteFeature(id);
        toast.success('Đã xóa tính năng');
        loadFeatures();
      } catch (err) {
        toast.error('Lỗi khi xóa tính năng');
      }
    }
  };

  if (isLoading && features.length === 0) {
    return <LandingSkeleton />;
  }

  return (
    <div className="space-y-6 mt-0">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Danh sách tính năng ({features.length})</h2>
        {!isEditing && (
          <Button
            onClick={() => {
              setIsEditing(true);
              setEditingId(null);
              setFeatureForm({ icon: 'DatabaseIcon', title: '', description: '' });
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/10 cursor-pointer flex items-center gap-2"
          >
            <Plus className="size-4" /> Thêm tính năng mới
          </Button>
        )}
      </div>

      {/* Feature Form (Create/Edit) */}
      {isEditing && (
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Chỉnh sửa tính năng' : 'Thêm tính năng mới vào database'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-2">
                  Icon hiển thị
                  <IconRenderer
                    iconName={featureForm.icon}
                    className="size-4 text-blue-500 bg-blue-500/10 p-0.5 rounded"
                  />
                </Label>
                <select
                  value={featureForm.icon}
                  onChange={(e) => setFeatureForm((prev) => ({ ...prev, icon: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {AVAILABLE_ICONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="font-semibold">Tiêu đề tính năng</Label>
                <Input
                  value={featureForm.title}
                  onChange={(e) => setFeatureForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ví dụ: Nhập dữ liệu tự động"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Mô tả tính năng</Label>
              <Textarea
                value={featureForm.description}
                onChange={(e) =>
                  setFeatureForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                placeholder="Mô tả tóm tắt tính năng..."
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveFeature}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Lưu thông tin
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Features list */}
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feat) => (
          <Card
            key={feat.id}
            className="border border-border hover:shadow-sm transition-all bg-card"
          >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <IconRenderer iconName={feat.icon} className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">{feat.title}</CardTitle>
                  <span className="text-[10px] text-muted-foreground font-mono font-normal">
                    ({feat.icon})
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEditFeature(feat)}
                  className="size-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer rounded-md transition-colors"
                >
                  <Edit className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteFeature(feat.id!)}
                  className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-md transition-colors"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{feat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
