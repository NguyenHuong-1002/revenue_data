'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { saveLandingConfig, defaultLandingConfig, LandingConfig } from '@/lib/landing-config';
import { RotateCcw, Save, Layers, BarChart3, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GeneralTabProps {
  config: LandingConfig;
  setConfig: React.Dispatch<React.SetStateAction<LandingConfig | null>>;
}

export function GeneralTab({ config, setConfig }: GeneralTabProps) {
  const handleSaveGeneral = () => {
    saveLandingConfig(config);
    toast.success('Cập nhật thông tin chung thành công!');
  };

  const handleResetGeneral = () => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Bạn có chắc chắn muốn khôi phục về cấu hình mặc định?')
    ) {
      setConfig({ ...defaultLandingConfig });
      saveLandingConfig(defaultLandingConfig);
      toast.success('Đã khôi phục thông tin chung về mặc định!');
    }
  };

  const updateHero = (key: 'heroTitle' | 'heroSubtitle', val: string) => {
    setConfig((prev) => (prev ? { ...prev, [key]: val } : null));
  };

  const updateStat = (index: number, key: 'value' | 'label', val: string) => {
    setConfig((prev) => {
      if (!prev) return null;
      const newStats = [...prev.stats];
      newStats[index] = { ...newStats[index], [key]: val };
      return { ...prev, stats: newStats };
    });
  };

  const updateFaq = (index: number, key: 'question' | 'answer', val: string) => {
    setConfig((prev) => {
      if (!prev) return null;
      const newFaqs = [...prev.faqs];
      newFaqs[index] = { ...newFaqs[index], [key]: val };
      return { ...prev, faqs: newFaqs };
    });
  };

  return (
    <div className="space-y-6 mt-0">
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleResetGeneral}
          className="flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="size-4" />
          Khôi phục mặc định
        </Button>
        <Button
          onClick={handleSaveGeneral}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Save className="size-4" />
          Lưu cấu hình chung
        </Button>
      </div>

      {/* Section 1: Hero */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-border bg-muted/20 pb-4">
          <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Layers className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Khu vực Giới thiệu (Hero Section)</CardTitle>
            <CardDescription>
              Tiêu đề chính và mô tả nổi bật trên trang chủ (lưu cục bộ)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="heroTitle" className="font-semibold text-foreground">
              Tiêu đề chính
            </Label>
            <Input
              id="heroTitle"
              value={config.heroTitle}
              onChange={(e) => updateHero('heroTitle', e.target.value)}
              placeholder="Nhập tiêu đề chính..."
              className="bg-background text-foreground border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSubtitle" className="font-semibold text-foreground">
              Mô tả phụ
            </Label>
            <Textarea
              id="heroSubtitle"
              rows={4}
              value={config.heroSubtitle}
              onChange={(e) => updateHero('heroSubtitle', e.target.value)}
              placeholder="Nhập mô tả chi tiết..."
              className="bg-background text-foreground border-border resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Stats */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-border bg-muted/20 pb-4">
          <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Các số liệu thống kê (Stats Section)</CardTitle>
            <CardDescription>
              Hiển thị 4 con số ấn tượng về doanh nghiệp (lưu cục bộ)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {config.stats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border bg-muted/5 space-y-4">
                <div className="font-semibold text-sm text-blue-500 flex items-center justify-between">
                  <span>Chỉ số {idx + 1}</span>
                </div>
                <div className="grid gap-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Giá trị (ví dụ: 10K+, 99.9%)
                    </Label>
                    <Input
                      value={stat.value}
                      onChange={(e) => updateStat(idx, 'value', e.target.value)}
                      className="bg-background border-border mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Nhãn hiển thị
                    </Label>
                    <Input
                      value={stat.label}
                      onChange={(e) => updateStat(idx, 'label', e.target.value)}
                      className="bg-background border-border mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: FAQs */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-border bg-muted/20 pb-4">
          <div className="size-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
            <HelpCircle className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Câu hỏi thường gặp (FAQ Section)</CardTitle>
            <CardDescription>
              Cung cấp câu trả lời nhanh cho 3 câu hỏi chính (lưu cục bộ)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {config.faqs.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-lg border border-border bg-muted/5 space-y-4">
              <div className="font-semibold text-sm text-blue-500">
                Câu hỏi thường gặp {idx + 1}
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-foreground">Câu hỏi</Label>
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                    className="bg-background border-border mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground">Câu trả lời</Label>
                  <Textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                    className="bg-background border-border mt-1 resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
