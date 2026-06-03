export interface StatItem {
  value: string;
  label: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface LandingConfig {
  heroTitle: string;
  heroSubtitle: string;
  stats: StatItem[];
  faqs: FaqItem[];
}

export const defaultLandingConfig: LandingConfig = {
  heroTitle: 'Quản lý dữ liệu doanh thu & tự động hóa dự báo',
  heroSubtitle:
    'Nền tảng vận hành doanh thu doanh nghiệp — nhập dữ liệu Excel thông minh, quản lý đa chi nhánh và nhà máy, tích hợp mô hình phân tích xu hướng và xuất báo cáo tài chính chuẩn xác.',
  stats: [
    { value: '10K+', label: 'Người dùng đang hoạt động' },
    { value: '500+', label: 'Doanh nghiệp tin dùng' },
    { value: '99.9%', label: 'Thời gian hoạt động' },
    { value: '50M+', label: 'Giao dịch theo dõi' },
  ],
  faqs: [
    {
      question: 'Hệ thống hỗ trợ những định dạng file nào khi nhập dữ liệu?',
      answer:
        'Chúng tôi hỗ trợ đầy đủ các định dạng Excel (.xlsx, .xls) và CSV. Hệ thống có bộ phân tích thông minh tự động mapping các cột dữ liệu bán hàng, sản phẩm và tồn kho.',
    },
    {
      question: 'Dữ liệu dự báo được tính toán như thế nào?',
      answer:
        'Dự báo doanh thu và tồn kho được tính toán bằng thuật toán làm phẳng mũ (Exponential Smoothing) tích hợp, phân tích xu hướng lịch sử dữ liệu để đưa ra các dự đoán tối ưu cho chu kỳ tiếp theo.',
    },
    {
      question: 'Hệ thống có chế độ ngoại tuyến không?',
      answer:
        'Có, frontend tích hợp chế độ Demo Fallback thông minh. Khi mất kết nối máy chủ backend, hệ thống tự động chuyển sang chế độ ngoại tuyến để bạn trải nghiệm giao diện mượt mà.',
    },
  ],
};

export function getLandingConfig(): LandingConfig {
  if (typeof window === 'undefined') return defaultLandingConfig;
  const saved = localStorage.getItem('landingPageConfig');
  if (!saved) return defaultLandingConfig;
  try {
    return { ...defaultLandingConfig, ...JSON.parse(saved) };
  } catch {
    return defaultLandingConfig;
  }
}

export function saveLandingConfig(config: LandingConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('landingPageConfig', JSON.stringify(config));
  }
}
