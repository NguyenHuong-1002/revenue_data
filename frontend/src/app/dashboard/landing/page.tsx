'use client';

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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  getLandingConfig,
  saveLandingConfig,
  defaultLandingConfig,
  LandingConfig,
} from '@/lib/landing-config';
import {
  landingService,
  FeatureItem,
  AiInsightItem,
  TestimonialItem,
  PricingItem,
} from '@/lib/services/landing.service';
import {
  LayoutGrid,
  AlertCircle,
  Save,
  RotateCcw,
  HelpCircle,
  BarChart3,
  Globe,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Sparkles,
  Star,
  CreditCard,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

import * as LucideIcons from 'lucide-react';

function IconRenderer({
  iconName,
  className = 'h-5 w-5',
}: {
  iconName?: string;
  className?: string;
}) {
  if (!iconName) return <LucideIcons.HelpCircle className={className} />;
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
  return <IconComponent className={className} />;
}

const AVAILABLE_ICONS = [
  'DatabaseIcon',
  'Building2Icon',
  'FactoryIcon',
  'PackageIcon',
  'CandlestickChartIcon',
  'BrainCircuitIcon',
  'DownloadIcon',
  'BellIcon',
  'NetworkIcon',
  'TrendingUpIcon',
  'SparklesIcon',
  'ShieldAlert',
  'HelpCircle',
  'MessageSquare',
  'Zap',
  'Layers',
  'Star',
];

export default function LandingManagerPage() {
  const [activeTab, setActiveTab] = useState<
    'general' | 'features' | 'ai' | 'testimonials' | 'pricing'
  >('general');

  // Local config (Hero, Stats, FAQs)
  const [config, setConfig] = useState<LandingConfig | null>(null);

  // DB Lists
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [aiInsights, setAiInsights] = useState<AiInsightItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [pricing, setPricing] = useState<PricingItem[]>([]);

  // Form states (CRUD)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Feature Form
  const [featureForm, setFeatureForm] = useState<Partial<FeatureItem>>({
    icon: 'DatabaseIcon',
    title: '',
    description: '',
  });
  // AI Insight Form
  const [aiForm, setAiForm] = useState<Partial<AiInsightItem>>({
    icon: 'BrainCircuitIcon',
    title: '',
    description: '',
  });
  // Testimonial Form
  const [testimonialForm, setTestimonialForm] = useState<Partial<TestimonialItem>>({
    name: '',
    role: '',
    content: '',
  });
  // Pricing Form
  const [pricingForm, setPricingForm] = useState<{
    name: string;
    price: string;
    period: string;
    description: string;
    featuresRaw: string; // Separated by new lines
    popular: boolean;
  }>({ name: '', price: '', period: '/tháng', description: '', featuresRaw: '', popular: false });

  // Load All Data
  const loadData = async () => {
    try {
      const [feats, insights, tests, prices] = await Promise.all([
        landingService.getFeatures(),
        landingService.getAiInsights(),
        landingService.getTestimonials(),
        landingService.getPricing(),
      ]);
      setFeatures(feats);
      setAiInsights(insights);
      setTestimonials(tests);
      setPricing(prices);
    } catch (err) {
      console.error('Failed to fetch database values:', err);
      toast.error('Không thể kết nối đến cơ sở dữ liệu');
    }
  };

  useEffect(() => {
    setConfig(getLandingConfig());
    loadData();
  }, []);

  if (!config) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Đang tải cấu hình...</div>
      </div>
    );
  }

  // --- GENERAL CONFIG HANDLING ---
  const handleSaveGeneral = () => {
    saveLandingConfig(config);
    toast.success('Cập nhật thông tin chung thành công!');
  };

  const handleResetGeneral = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục về cấu hình mặc định?')) {
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

  // --- FEATURES CRUD ---
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
      loadData();
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
    if (confirm('Bạn có chắc chắn muốn xóa tính năng này?')) {
      try {
        await landingService.deleteFeature(id);
        toast.success('Đã xóa tính năng');
        loadData();
      } catch (err) {
        toast.error('Lỗi khi xóa tính năng');
      }
    }
  };

  // --- AI INSIGHTS CRUD ---
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
      loadData();
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
    if (confirm('Bạn có chắc chắn muốn xóa chức năng AI này?')) {
      try {
        await landingService.deleteAiInsight(id);
        toast.success('Đã xóa chức năng AI');
        loadData();
      } catch (err) {
        toast.error('Lỗi khi xóa chức năng AI');
      }
    }
  };

  // --- TESTIMONIALS CRUD ---
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
      loadData();
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
    if (confirm('Bạn có chắc chắn muốn xóa nhận xét này?')) {
      try {
        await landingService.deleteTestimonial(id);
        toast.success('Đã xóa nhận xét');
        loadData();
      } catch (err) {
        toast.error('Lỗi khi xóa nhận xét');
      }
    }
  };

  // --- PRICING CRUD ---
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
      loadData();
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
    if (confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) {
      try {
        await landingService.deletePricing(id);
        toast.success('Đã xóa gói dịch vụ');
        loadData();
      } catch (err) {
        toast.error('Lỗi khi xóa gói dịch vụ');
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col p-6 gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Globe className="size-8 text-blue-500" />
            Quản trị Landing Page
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý toàn bộ thông tin chung, chức năng AI, các tính năng nổi bật, phản hồi của khách hàng và bảng giá.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as any);
          setIsEditing(false);
        }}
        className="w-full flex flex-col gap-6"
      >
        <TabsList className="bg-muted p-1 rounded-full w-fit">
          <TabsTrigger value="general" className="cursor-pointer">
            Thông tin chung & FAQ
          </TabsTrigger>
          <TabsTrigger value="features" className="cursor-pointer">
            Tính năng nổi bật
          </TabsTrigger>
          <TabsTrigger value="ai" className="cursor-pointer">
            Chức năng AI
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="cursor-pointer">
            Ý kiến khách hàng
          </TabsTrigger>
          <TabsTrigger value="pricing" className="cursor-pointer">
            Gói Bảng giá
          </TabsTrigger>
        </TabsList>

        <div className="mt-2">
          {/* ==================== ACTIVE TAB: GENERAL ==================== */}
          <TabsContent value="general" className="space-y-6 mt-0">
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
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-border bg-muted/5 space-y-4"
                    >
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
                  <div
                    key={idx}
                    className="p-5 rounded-lg border border-border bg-muted/5 space-y-4"
                  >
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
          </TabsContent>

          {/* ==================== ACTIVE TAB: FEATURES (DB) ==================== */}
          <TabsContent value="features" className="space-y-6 mt-0">
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
              <Card className="border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/10 shadow-sm">
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
                        onChange={(e) =>
                          setFeatureForm((prev) => ({ ...prev, icon: e.target.value }))
                        }
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
                        onChange={(e) =>
                          setFeatureForm((prev) => ({ ...prev, title: e.target.value }))
                        }
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
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="cursor-pointer">
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
                <Card key={feat.id} className="border border-border hover:shadow-sm transition-all bg-card">
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
          </TabsContent>

          {/* ==================== ACTIVE TAB: AI INSIGHTS (DB) ==================== */}
          <TabsContent value="ai" className="space-y-6 mt-0">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Danh sách chức năng AI ({aiInsights.length})</h2>
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
          </TabsContent>

          {/* ==================== ACTIVE TAB: TESTIMONIALS (DB) ==================== */}
          <TabsContent value="testimonials" className="space-y-6 mt-0">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Danh sách ý kiến khách hàng ({testimonials.length})
              </h2>
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
          </TabsContent>

          {/* ==================== ACTIVE TAB: PRICING (DB) ==================== */}
          <TabsContent value="pricing" className="space-y-6 mt-0">
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
                        onChange={(e) =>
                          setPricingForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Ví dụ: Chuyên nghiệp"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Giá cả (ví dụ: 1.499.000, Liên hệ)</Label>
                      <Input
                        value={pricingForm.price}
                        onChange={(e) =>
                          setPricingForm((prev) => ({ ...prev, price: e.target.value }))
                        }
                        placeholder="Ví dụ: 1.499.000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Chu kỳ (ví dụ: /tháng, để trống)</Label>
                      <Input
                        value={pricingForm.period}
                        onChange={(e) =>
                          setPricingForm((prev) => ({ ...prev, period: e.target.value }))
                        }
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
                    <Label className="font-semibold">
                      Các tính năng (Mỗi dòng là một tính năng)
                    </Label>
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
                      onChange={(e) =>
                        setPricingForm((prev) => ({ ...prev, popular: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <Label htmlFor="popular" className="font-semibold cursor-pointer">
                      Đánh dấu gói này là phổ biến nhất (Nổi bật màu xanh)
                    </Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t border-border pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="cursor-pointer">
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
            <div className="grid gap-4 md:grid-cols-3">
              {pricing.map((plan) => {
                let parsed: string[] = [];
                try {
                  parsed = JSON.parse(plan.features);
                } catch {
                  parsed = [String(plan.features)];
                }
                return (
                  <Card
                    key={plan.id}
                    className={`border hover:shadow-md transition-all flex flex-col justify-between ${
                      plan.popular === 1
                        ? 'border-blue-500/50 bg-blue-500/5 dark:bg-blue-950/10 ring-1 ring-blue-500/30'
                        : 'border-border bg-card'
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base font-bold flex items-center gap-2">
                            {plan.name}
                            {plan.popular === 1 && (
                              <Badge className="bg-blue-600 hover:bg-blue-500 text-white border-transparent">
                                Nổi bật
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">{plan.description}</CardDescription>
                        </div>
                        <div className="flex gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditPricing(plan)}
                            className="size-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer rounded-md transition-colors"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePricing(plan.id!)}
                            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-md transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="mt-3">
                        <span className="text-xl font-bold text-blue-600">{plan.price}</span>
                        <span className="text-xs text-muted-foreground">{plan.period}</span>
                      </p>
                    </CardHeader>
                    <CardContent className="pt-2 flex-1 flex flex-col justify-between">
                      <ul className="space-y-1.5 text-xs text-muted-foreground mb-4">
                        {parsed.map((f, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <Check className="size-3.5 mt-0.5 text-emerald-500 shrink-0" />
                            <span className="line-clamp-2">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
