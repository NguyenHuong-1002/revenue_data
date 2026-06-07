'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { landingService, AiInsightItem } from '@/lib/services/landing.service';
import { Plus, Edit, Trash2, LayoutGrid, Columns } from 'lucide-react';
import { toast } from 'sonner';
import { IconRenderer, AVAILABLE_ICONS } from './icon-renderer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function AiInsightsTab() {
  const [aiInsights, setAiInsights] = useState<AiInsightItem[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  const [aiForm, setAiForm] = useState<Partial<AiInsightItem>>({
    icon: 'BrainCircuitIcon',
    title: '',
    description: '',
  });

  const loadAiInsights = async () => {
    setIsLoading(true);
    try {
      const data = await landingService.getAiInsights();
      setAiInsights(data);
    } catch (err) {
      console.error('Failed to fetch AI Insights:', err);
      toast.error('Không thể tải danh sách chức năng AI');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAiInsights();
  }, []);

  const handleSaveAiInsight = async () => {
    if (!aiForm.title || !aiForm.description) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      if (editingId) {
        await landingService.updateAiInsight(editingId, aiForm);
        toast.success('Cập nhật chức năng AI thành công');
      } else {
        await landingService.createAiInsight(aiForm);
        toast.success('Thêm chức năng AI mới thành công');
      }
      setIsEditing(false);
      setEditingId(null);
      setAiForm({ icon: 'BrainCircuitIcon', title: '', description: '' });
      loadAiInsights();
    } catch (err) {
      toast.error('Lỗi khi lưu chức năng AI');
    }
  };

  const startEditAi = (item: AiInsightItem) => {
    setAiForm({ icon: item.icon, title: item.title, description: item.description });
    setEditingId(item.id!);
    setIsEditing(true);
  };

  const handleDeleteAi = async (id: number) => {
    if (typeof window !== 'undefined' && window.confirm('Bạn có chắc chắn muốn xóa chức năng AI này?')) {
      try {
        await landingService.deleteAiInsight(id);
        toast.success('Đã xóa chức năng AI');
        loadAiInsights();
      } catch (err) {
        toast.error('Lỗi khi xóa chức năng AI');
      }
    }
  };

  if (isLoading && aiInsights.length === 0) {
    return (
      <div className="flex h-[30vh] items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Đang tải tính năng AI...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-0">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Danh sách chức năng AI ({aiInsights.length})</h2>
          <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/30">
            <Button
              variant={viewMode === 'carousel' ? 'secondary' : 'ghost'}
              size="icon"
              className="size-7 rounded-md cursor-pointer"
              onClick={() => setViewMode('carousel')}
              title="Dạng trình trượt (Carousel)"
            >
              <Columns className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="size-7 rounded-md cursor-pointer"
              onClick={() => setViewMode('grid')}
              title="Dạng lưới (Grid)"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
          </div>
        </div>

        {!isEditing && (
          <Button
            onClick={() => {
              setIsEditing(true);
              setEditingId(null);
              setAiForm({ icon: 'BrainCircuitIcon', title: '', description: '' });
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/10 cursor-pointer flex items-center gap-2"
          >
            <Plus className="size-4" /> Thêm chức năng AI mới
          </Button>
        )}
      </div>

      {/* AI Form (Create/Edit) */}
      {isEditing && (
        <Card className="border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Chỉnh sửa chức năng AI' : 'Thêm chức năng AI mới vào database'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-2">
                  Icon hiển thị
                  <IconRenderer
                    iconName={aiForm.icon}
                    className="size-4 text-blue-500 bg-blue-500/10 p-0.5 rounded"
                  />
                </Label>
                <select
                  value={aiForm.icon}
                  onChange={(e) => setAiForm((prev) => ({ ...prev, icon: e.target.value }))}
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
                <Label className="font-semibold">Tên chức năng AI</Label>
                <Input
                  value={aiForm.title}
                  onChange={(e) => setAiForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ví dụ: Dự báo xu hướng"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Mô tả chức năng AI</Label>
              <Textarea
                value={aiForm.description}
                onChange={(e) =>
                  setAiForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                placeholder="Mô tả cách AI hoạt động..."
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="cursor-pointer">
              Hủy
            </Button>
            <Button
              onClick={handleSaveAiInsight}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Lưu thông tin
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* AI list */}
      {viewMode === 'carousel' && aiInsights.length > 0 ? (
        <div className="relative px-10 w-full">
          <Carousel opts={{ align: 'start' }} className="w-full">
            <CarouselContent>
              {aiInsights.map((ai) => (
                <CarouselItem key={ai.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card
                    className="border border-border hover:shadow-sm transition-all flex flex-col justify-between bg-card h-full"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                          <IconRenderer iconName={ai.icon} className="size-5" />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditAi(ai)}
                            className="size-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer rounded-md transition-colors"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAi(ai.id!)}
                            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-md transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-base font-bold mt-3">
                        {ai.title}
                        <span className="ml-1.5 text-[10px] text-muted-foreground font-mono font-normal block sm:inline">
                          ({ai.icon})
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pt-2">
                      <p className="text-sm text-muted-foreground line-clamp-4">{ai.description}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-card hover:bg-muted" />
            <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-card hover:bg-muted" />
          </Carousel>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {aiInsights.map((ai) => (
            <Card
              key={ai.id}
              className="border border-border hover:shadow-sm transition-all flex flex-col justify-between bg-card"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <IconRenderer iconName={ai.icon} className="size-5" />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditAi(ai)}
                      className="size-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer rounded-md transition-colors"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAi(ai.id!)}
                      className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-md transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base font-bold mt-3">
                  {ai.title}
                  <span className="ml-1.5 text-[10px] text-muted-foreground font-mono font-normal">
                    ({ai.icon})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-4">{ai.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
