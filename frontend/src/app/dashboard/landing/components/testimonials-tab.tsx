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
import { landingService, TestimonialItem } from '@/lib/services/landing.service';
import { Plus, Edit, Trash2, LayoutGrid, Columns } from 'lucide-react';
import { toast } from 'sonner';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  const [testimonialForm, setTestimonialForm] = useState<Partial<TestimonialItem>>({
    name: '',
    role: '',
    content: '',
  });

  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const data = await landingService.getTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
      toast.error('Không thể tải nhận xét khách hàng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleSaveTestimonial = async () => {
    if (!testimonialForm.name || !testimonialForm.role || !testimonialForm.content) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      if (editingId) {
        await landingService.updateTestimonial(editingId, testimonialForm);
        toast.success('Cập nhật nhận xét thành công');
      } else {
        await landingService.createTestimonial(testimonialForm);
        toast.success('Thêm nhận xét mới thành công');
      }
      setIsEditing(false);
      setEditingId(null);
      setTestimonialForm({ name: '', role: '', content: '' });
      loadTestimonials();
    } catch (err) {
      toast.error('Lỗi khi lưu nhận xét');
    }
  };

  const startEditTestimonial = (item: TestimonialItem) => {
    setTestimonialForm({ name: item.name, role: item.role, content: item.content });
    setEditingId(item.id!);
    setIsEditing(true);
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (typeof window !== 'undefined' && window.confirm('Bạn có chắc chắn muốn xóa nhận xét này?')) {
      try {
        await landingService.deleteTestimonial(id);
        toast.success('Đã xóa nhận xét');
        loadTestimonials();
      } catch (err) {
        toast.error('Lỗi khi xóa nhận xét');
      }
    }
  };

  if (isLoading && testimonials.length === 0) {
    return (
      <div className="flex h-[30vh] items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Đang tải ý kiến khách hàng...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-0">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">
            Danh sách ý kiến khách hàng ({testimonials.length})
          </h2>
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
              setTestimonialForm({ name: '', role: '', content: '' });
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/10 cursor-pointer flex items-center gap-2"
          >
            <Plus className="size-4" /> Thêm phản hồi mới
          </Button>
        )}
      </div>

      {/* Testimonial Form (Create/Edit) */}
      {isEditing && (
        <Card className="border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Chỉnh sửa phản hồi' : 'Thêm phản hồi mới vào database'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-semibold">Tên khách hàng</Label>
                <Input
                  value={testimonialForm.name}
                  onChange={(e) =>
                    setTestimonialForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ví dụ: Anh Minh Nguyễn"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Chức danh / Đơn vị</Label>
                <Input
                  value={testimonialForm.role}
                  onChange={(e) =>
                    setTestimonialForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                  placeholder="Ví dụ: Giám đốc tài chính, TechVina"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Ý kiến / Lời chứng thực</Label>
              <Textarea
                value={testimonialForm.content}
                onChange={(e) =>
                  setTestimonialForm((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={3}
                placeholder="Nhập nội dung phản hồi của khách hàng..."
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="cursor-pointer">
              Hủy
            </Button>
            <Button
              onClick={handleSaveTestimonial}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Lưu thông tin
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Testimonials list */}
      {viewMode === 'carousel' && testimonials.length > 0 ? (
        <div className="relative px-10 w-full">
          <Carousel opts={{ align: 'start' }} className="w-full">
            <CarouselContent>
              {testimonials.map((test) => (
                <CarouselItem key={test.id} className="md:basis-1/2">
                  <Card
                    className="border border-border hover:shadow-sm transition-all flex flex-col justify-between bg-card h-full"
                  >
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-sm font-semibold text-white shrink-0">
                          {test.name.charAt(0)}
                        </span>
                        <div>
                          <CardTitle className="text-base font-bold">{test.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{test.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditTestimonial(test)}
                          className="size-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer rounded-md transition-colors"
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTestimonial(test.id!)}
                          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-md transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm italic text-muted-foreground">
                        &ldquo;{test.content}&rdquo;
                      </p>
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
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((test) => (
            <Card
              key={test.id}
              className="border border-border hover:shadow-sm transition-all flex flex-col justify-between bg-card"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-sm font-semibold text-white shrink-0">
                    {test.name.charAt(0)}
                  </span>
                  <div>
                    <CardTitle className="text-base font-bold">{test.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{test.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditTestimonial(test)}
                    className="size-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer rounded-md transition-colors"
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTestimonial(test.id!)}
                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-md transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;{test.content}&rdquo;
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
