import { HelpCircle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    id: 'faq-1',
    category: 'Chung',
    question: 'Hệ thống Quản lý Doanh thu và Kho hàng là gì?',
    answer:
      'Đây là giải pháp quản trị toàn diện giúp theo dõi doanh số, quản lý hàng tồn kho thực tế tại các nhà máy, và tích hợp AI để phân tích xu hướng dự báo nhu cầu hàng hóa.',
  },
  {
    id: 'faq-2',
    category: 'Tính năng',
    question: 'Làm thế nào để xuất báo cáo thống kê doanh thu?',
    answer:
      'Truy cập mục "Báo cáo doanh thu", chọn khoảng thời gian và các bộ lọc mong muốn, sau đó nhấn nút "Xuất báo cáo PDF" hoặc "Xuất báo cáo Excel" ở góc trên bên phải để tải tệp về.',
  },
  {
    id: 'faq-3',
    category: 'Tính năng',
    question: 'Làm thế nào để cập nhật danh mục tồn kho của nhà máy?',
    answer:
      'Nhân viên có quyền quản trị kho có thể vào mục "Quản lý tồn kho" hoặc "Quản lý sản phẩm" để chỉnh sửa số lượng thực tế tồn kho hoặc thêm mới sản phẩm.',
  },
  {
    id: 'faq-4',
    category: 'AI',
    question: 'Thuật toán dự báo xu hướng hoạt động như thế nào?',
    answer:
      'Hệ thống sử dụng các mô hình Holt-Winters và Trung bình trượt lũy thừa (EMA) kết hợp Hồi quy tuyến tính để phân tích dữ liệu lịch sử bán hàng và đưa ra dự đoán xu hướng cho 3-6 tháng tới.',
  },
  {
    id: 'faq-5',
    category: 'Bảo mật',
    question: 'Tôi có thể phân quyền cho nhân viên của mình như thế nào?',
    answer:
      'Tài khoản Quản trị viên (ADMIN) truy cập mục "Quản lý tài khoản" để tạo mới và phân quyền cụ thể (ADMIN, STAFF) tương ứng với từng chi nhánh hoặc nhà máy.',
  },
];

const CATEGORIES = ['Tất cả', 'Chung', 'Tính năng', 'AI', 'Bảo mật'];

interface FaqSectionProps {
  searchQuery: string;
}

export function FaqSection({ searchQuery }: FaqSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory = activeCategory === 'Tất cả' || faq.category === activeCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer',
              activeCategory === cat
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-card border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <Card className="border-border/50 shadow-xs">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-indigo-500" />
            Câu hỏi thường gặp
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/30 p-0">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="transition-all hover:bg-muted/5">
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between text-left p-4 font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 transition-colors cursor-pointer text-sm"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-indigo-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed bg-indigo-500/5 border-l-2 border-indigo-500">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShieldAlert className="h-8 w-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-foreground">Không tìm thấy câu hỏi</p>
              <p className="text-xs text-muted-foreground">Thử tìm với từ khóa khác.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
