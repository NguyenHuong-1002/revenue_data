'use client';

import { Plus, Edit, Trash2, Check, Sparkles, Zap, Crown, Layers } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { landingService, PricingItem } from '@/lib/services/landing.service';

// Helper to determine the visual icon representing the pricing plan tier
function getPlanIcon(name: string) {
  const lowerName = name.toLowerCase();
  if (
    lowerName.includes('cơ bản') ||
    lowerName.includes('basic') ||
    lowerName.includes('starter') ||
    lowerName.includes('thử nghiệm')
  ) {
    return <Sparkles className="size-5 text-zinc-400 shrink-0" />;
  }
  if (
    lowerName.includes('chuyên nghiệp') ||
    lowerName.includes('pro') ||
    lowerName.includes('professional') ||
    lowerName.includes('premium')
  ) {
    return <Zap className="size-5 text-amber-500 shrink-0 fill-amber-500/20" />;
  }
  if (
    lowerName.includes('doanh nghiệp') ||
    lowerName.includes('enterprise') ||
    lowerName.includes('công ty') ||
    lowerName.includes('vip') ||
    lowerName.includes('crown')
  ) {
    return <Crown className="size-5 text-blue-500 shrink-0 fill-blue-500/10" />;
  }
  return <Layers className="size-5 text-blue-600 shrink-0" />;
}

export function PricingTab() {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [pricingForm, setPricingForm] = useState<{
    name: string;
    price: string;
    period: string;
    description: string;
    featuresRaw: string;
    popular: boolean;
  }>({ name: '', price: '', period: '/tháng', description: '', featuresRaw: '', popular: false });

  const loadPricing = async () => {
    setIsLoading(true);
    try {
      const data = await landingService.getPricing();
      setPricing(data);
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
      toast.error('Không thể tải danh sách gói dịch vụ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPricing();
  }, []);

  const handleSavePricing = async () => {
    if (!pricingForm.name || !pricingForm.price || !pricingForm.featuresRaw) {
      toast.error('Vui lòng điền tên gói, giá và các tính năng');
      return;
    }
    const featuresArr = pricingForm.featuresRaw
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
    const dbPayload: Partial<PricingItem> = {
      name: pricingForm.name,
      price: pricingForm.price,
      period: pricingForm.period,
      description: pricingForm.description,
      features: JSON.stringify(featuresArr),
      popular: pricingForm.popular ? 1 : 0,
    };

    try {
      if (editingId) {
        await landingService.updatePricing(editingId, dbPayload);
        toast.success('Cập nhật gói bảng giá thành công');
      } else {
        await landingService.createPricing(dbPayload);
        toast.success('Thêm gói bảng giá mới thành công');
      }
      setIsEditing(false);
      setEditingId(null);
      setPricingForm({
        name: '',
        price: '',
        period: '/tháng',
        description: '',
        featuresRaw: '',
        popular: false,
      });
      loadPricing();
    } catch (err) {
      toast.error('Lỗi khi lưu gói bảng giá');
    }
  };

  const startEditPricing = (item: PricingItem) => {
    let rawFeats = '';
    try {
      const arr = JSON.parse(item.features);
      rawFeats = Array.isArray(arr) ? arr.join('\n') : String(item.features);
    } catch {
      rawFeats = String(item.features);
    }

    setPricingForm({
      name: item.name,
      price: item.price,
      period: item.period,
      description: item.description,
      featuresRaw: rawFeats,
      popular: item.popular === 1,
    });
    setEditingId(item.id!);
    setIsEditing(true);
  };

  const handleDeletePricing = async (id: number) => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')
    ) {
      try {
        await landingService.deletePricing(id);
        toast.success('Đã xóa gói dịch vụ');
        loadPricing();
      } catch (err) {
        toast.error('Lỗi khi xóa gói dịch vụ');
      }
    }
  };

  if (isLoading && pricing.length === 0) {
    return (
      <div className="flex h-[30vh] items-center justify-center">
        <div className="text-muted-foreground animate-pulse">
          Đang tải danh sách gói bảng giá...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-0">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Danh sách gói dịch vụ ({pricing.length})</h2>
        {!isEditing && (
          <Button
            onClick={() => {
              setIsEditing(true);
              setEditingId(null);
              setPricingForm({
                name: '',
                price: '',
                period: '/tháng',
                description: '',
                featuresRaw: '',
                popular: false,
              });
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/10 cursor-pointer flex items-center gap-2"
          >
            <Plus className="size-4" /> Thêm gói mới
          </Button>
        )}
      </div>

      {/* Pricing Form (Create/Edit) */}
      {isEditing && (
        <Card className="border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Chỉnh sửa gói dịch vụ' : 'Thêm gói dịch vụ mới vào database'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-semibold">Tên gói dịch vụ</Label>
                <Input
                  value={pricingForm.name}
                  onChange={(e) => setPricingForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ví dụ: Chuyên nghiệp"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Giá cả (ví dụ: 1.499.000, Liên hệ)</Label>
                <Input
                  value={pricingForm.price}
                  onChange={(e) => setPricingForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="Ví dụ: 1.499.000"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Chu kỳ (ví dụ: /tháng, để trống)</Label>
                <Input
                  value={pricingForm.period}
                  onChange={(e) => setPricingForm((prev) => ({ ...prev, period: e.target.value }))}
                  placeholder="Ví dụ: /tháng"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Mô tả ngắn</Label>
              <Input
                value={pricingForm.description}
                onChange={(e) =>
                  setPricingForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Ví dụ: Dành cho doanh nghiệp vừa và lớn"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Các tính năng (Mỗi dòng là một tính năng)</Label>
              <Textarea
                value={pricingForm.featuresRaw}
                onChange={(e) =>
                  setPricingForm((prev) => ({ ...prev, featuresRaw: e.target.value }))
                }
                rows={5}
                placeholder="Tính năng A&#10;Tính năng B&#10;Tính năng C..."
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="popular"
                checked={pricingForm.popular}
                onChange={(e) => setPricingForm((prev) => ({ ...prev, popular: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <Label htmlFor="popular" className="font-semibold cursor-pointer">
                Đánh dấu gói này là phổ biến nhất (Nổi bật màu xanh)
              </Label>
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
              onClick={handleSavePricing}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Lưu thông tin
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Pricing list */}
      <div className="grid gap-6 md:grid-cols-3">
        {pricing.map((plan) => {
          let parsed: string[] = [];
          try {
            parsed = JSON.parse(plan.features);
          } catch {
            parsed = [String(plan.features)];
          }

          const isPopular = plan.popular === 1;

          return (
            <Card
              key={plan.id}
              className={`border transition-all duration-300 flex flex-col justify-between overflow-hidden relative group ${
                isPopular
                  ? 'border-blue-500 bg-gradient-to-b from-blue-500/[0.04] to-transparent dark:from-blue-950/20 dark:to-transparent ring-1 ring-blue-500/30 shadow-[0_12px_30px_-10px_rgba(59,130,246,0.15)] dark:shadow-[0_15px_40px_-12px_rgba(59,130,246,0.35)] scale-[1.01] z-10'
                  : 'border-border bg-card hover:border-border/80 hover:shadow-md'
              }`}
            >
              {/* Highlight gradient ribbon on top of popular package */}
              {isPopular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />
              )}

              <CardHeader className="pb-3 relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    {getPlanIcon(plan.name)}
                    <CardTitle className="text-lg font-extrabold tracking-tight text-foreground">
                      {plan.name}
                    </CardTitle>
                  </div>
                  <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditPricing(plan)}
                      className="size-7 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer rounded-md transition-colors"
                    >
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePricing(plan.id!)}
                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-md transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="mt-2.5">
                  <CardDescription className="line-clamp-2 text-xs text-muted-foreground leading-relaxed min-h-[2rem]">
                    {plan.description || 'Gói dịch vụ cao cấp tối ưu hóa cho doanh thu của bạn.'}
                  </CardDescription>
                </div>

                {isPopular && (
                  <div className="absolute top-3 right-10">
                    <Badge className="bg-blue-600 hover:bg-blue-500 text-white border-transparent text-[10px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider shrink-0">
                      Nổi bật
                    </Badge>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border/40 flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight text-foreground bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-xs font-semibold text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-3 flex-1 flex flex-col justify-between">
                <ul className="space-y-2.5 text-xs text-muted-foreground mb-6">
                  {parsed.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="flex size-4.5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <Check className="size-3" />
                      </span>
                      <span className="line-clamp-2 text-foreground/85 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isPopular ? 'default' : 'outline'}
                  className={`w-full font-bold text-xs py-2 h-9 rounded-xl transition-all ${
                    isPopular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/10'
                      : 'border-border text-foreground hover:bg-muted/80'
                  }`}
                  disabled
                >
                  {plan.price.toLowerCase().includes('liên hệ')
                    ? 'Liên hệ báo giá'
                    : 'Bắt đầu sử dụng'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
