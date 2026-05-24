import Link from "next/link"
import {
  ArrowRightIcon,
  BarChart3Icon,
  DatabaseIcon,
  LineChartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
  RefreshCwIcon,
  FileTextIcon,
  CheckCircleIcon,
  StarIcon,
  ChevronRightIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const metrics = [
  {
    label: "Theo dõi doanh thu",
    value: "$1.25M",
    change: "+12.5%",
  },
  {
    label: "Tài khoản hoạt động",
    value: "45,678",
    change: "+8.2%",
  },
  {
    label: "Tỷ lệ tăng trưởng",
    value: "4.5%",
    change: "+1.1%",
  },
]

const features = [
  {
    icon: DatabaseIcon,
    title: "Dữ liệu bán hàng sạch",
    description:
      "Nhập tệp sản phẩm, tồn kho và doanh số hàng tháng vào một lớp báo cáo đáng tin cậy.",
  },
  {
    icon: LineChartIcon,
    title: "Xu hướng dễ đọc",
    description:
      "Phát hiện biến động doanh thu, thay đổi khách hàng và hiệu suất sản phẩm mà không cần lục tung bảng tính.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Bối cảnh vận hành",
    description:
      "Giữ cho nhóm luôn đồng bộ với các chế độ xem dashboard phù hợp với quy trình tài chính và tồn kho thực tế.",
  },
]

const stats = [
  { value: "10K+", label: "Người dùng đang hoạt động" },
  { value: "500+", label: "Doanh nghiệp tin dùng" },
  { value: "99.9%", label: "Thời gian hoạt động" },
  { value: "50M+", label: "Giao dịch theo dõi" },
]

const testimonials = [
  {
    name: "Anh Minh Nguyễn",
    role: "Giám đốc Tài chính, TechVina",
    content:
      "Từ khi sử dụng hệ thống này, đội ngũ của tôi tiết kiệm được hơn 20 giờ mỗi tuần cho việc tổng hợp báo cáo doanh thu.",
  },
  {
    name: "Chị Lan Trần",
    role: "Trưởng phòng Kinh doanh, GreenMart",
    content:
      "Giao diện trực quan giúp tôi nắm bắt tình hình kinh doanh chỉ trong 5 phút mỗi sáng. Đây là công cụ không thể thiếu.",
  },
  {
    name: "Anh Hoàng Lê",
    role: "CEO, StartUpPlus",
    content:
      "Chúng tôi đã tăng trưởng 40% sau 3 tháng nhờ vào các phân tích chi tiết mà dashboard này cung cấp.",
  },
]

const faqs = [
  {
    q: "Tôi có thể nhập dữ liệu từ những nguồn nào?",
    a: "Hệ thống hỗ trợ nhập dữ liệu từ file Excel, CSV, Google Sheets, và tích hợp trực tiếp với các nền tảng bán hàng phổ biến như Shopify, WooCommerce, và Sapo.",
  },
  {
    q: "Dữ liệu của tôi có được bảo mật không?",
    a: "Chúng tôi sử dụng mã hóa đầu cuối AES-256 và tuân thủ các tiêu chuẩn bảo mật quốc tế. Dữ liệu của bạn hoàn toàn riêng tư và an toàn.",
  },
  {
    q: "Tôi có thể tùy chỉnh bảng điều khiển không?",
    a: "Có. Bạn có thể kéo thả, sắp xếp, và tùy chỉnh hoàn toàn các chỉ số hiển thị trên dashboard theo nhu cầu cụ thể của doanh nghiệp.",
  },
  {
    q: "Hệ thống có hỗ trợ nhiều người dùng không?",
    a: "Có. Bạn có thể thêm toàn bộ đội ngũ với phân quyền chi tiết, giúp mọi người cùng làm việc trên cùng một bộ dữ liệu thống nhất.",
  },
]

const pricing = [
  {
    name: "Cơ bản",
    price: "499.000",
    period: "/tháng",
    description: "Dành cho doanh nghiệp nhỏ",
    features: [
      "Theo dõi doanh thu cơ bản",
      "Báo cáo hàng tháng",
      "Tối đa 3 người dùng",
      "Hỗ trợ qua email",
    ],
    popular: false,
  },
  {
    name: "Chuyên nghiệp",
    price: "1.499.000",
    period: "/tháng",
    description: "Dành cho đội ngũ đang mở rộng",
    features: [
      "Tất cả tính năng Cơ bản",
      "Phân tích nâng cao",
      "Tối đa 15 người dùng",
      "Tích hợp API",
      "Hỗ trợ ưu tiên 24/7",
    ],
    popular: true,
  },
  {
    name: "Doanh nghiệp",
    price: "Liên hệ",
    period: "",
    description: "Dành cho tổ chức lớn",
    features: [
      "Tất cả tính năng Chuyên nghiệp",
      "Không giới hạn người dùng",
      "Tùy chỉnh theo yêu cầu",
      "Đào tạo đội ngũ",
      "Quản lý tài khoản riêng",
    ],
    popular: false,
  },
]

export default function Home() {
  return (
    <main className="landing-surface min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-4xl bg-primary text-primary-foreground">
            <BarChart3Icon className="size-4" />
          </span>
          Hệ thống Doanh thu
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Tính năng
          </a>
          <a href="#stats" className="transition-colors hover:text-foreground">
            Thống kê
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Bảng giá
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
            <Link href="/auth/login">Đăng nhập</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard">
              Mở dashboard
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="flex max-w-3xl flex-col justify-center">
          <Badge variant="outline" className="mb-6 w-fit gap-1.5">
            <SparklesIcon className="size-3.5" />
            Không gian làm việc thông minh doanh thu
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Theo dõi doanh thu, tồn kho và dự đoán tăng trưởng từ dữ liệu
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            LandingPage này dẫn người dùng vào dashboard phân tích doanh thu,
            giúp đội ngũ quan sát chỉ số kinh doanh, xu hướng bán hàng, và dữ
            liệu sản phẩm trong cùng một trải nghiệm.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Đi đến dashboard
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#features">Xem tính năng</a>
            </Button>
          </div>
        </div>

        <div id="dashboard" className="relative">
          <Card className="landing-dashboard-card">
            <CardHeader className="border-b">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardDescription>Tổng quan</CardDescription>
                  <CardTitle className="mt-1 text-2xl font-bold">
                    Hiệu suất hàng tháng
                  </CardTitle>
                </div>
                <Badge variant="outline" className="gap-1">
                  <TrendingUpIcon className="size-3.5" />
                  Trực tiếp
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="landing-metric">
                    <p className="text-xs text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tabular-nums">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-revenue-positive">
                      {metric.change}
                    </p>
                  </div>
                ))}
              </div>

              <div className="landing-chart" aria-hidden="true">
                <span style={{ height: "42%" }} />
                <span style={{ height: "58%" }} />
                <span style={{ height: "48%" }} />
                <span style={{ height: "72%" }} />
                <span style={{ height: "66%" }} />
                <span style={{ height: "84%" }} />
                <span style={{ height: "76%" }} />
                <span style={{ height: "92%" }} />
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-3xl border bg-background/70 p-4">
                  <p className="font-medium">Danh mục hàng đầu</p>
                  <p className="mt-1 text-muted-foreground">Bán hàng theo sản phẩm</p>
                </div>
                <div className="rounded-3xl border bg-background/70 p-4">
                  <p className="font-medium">Đánh giá tiếp theo</p>
                  <p className="mt-1 text-muted-foreground">Đồng bộ tồn kho</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Tính năng</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Mọi thứ bạn cần để quản lý doanh thu
            </h2>
            <p className="mt-4 text-muted-foreground">
              Bộ công cụ toàn diện giúp đội ngũ của bạn vận hành trơn tru từ dữ liệu đến quyết định.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} size="sm" className="border bg-background/60">
                  <CardHeader>
                    <span className="mb-2 flex size-10 items-center justify-center rounded-4xl bg-secondary text-secondary-foreground">
                      <Icon className="size-4" />
                    </span>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Con số</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Được tin dùng bởi hàng ngàn doanh nghiệp
            </h2>
            <p className="mt-4 text-muted-foreground">
              Những con số biết nói từ cộng đồng người dùng của chúng tôi.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Quy trình</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Bắt đầu chỉ trong 3 bước
            </h2>
            <p className="mt-4 text-muted-foreground">
              Không cần cài đặt phức tạp. Không cần đào tạo dài dòng.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                icon: DatabaseIcon,
                title: "Kết nối dữ liệu",
                desc: "Tải lên file Excel, CSV hoặc kết nối trực tiếp với nền tảng bán hàng của bạn.",
              },
              {
                step: "02",
                icon: BarChart3Icon,
                title: "Xem báo cáo",
                desc: "Dashboard trực quan hiển thị ngay lập tức các chỉ số kinh doanh quan trọng nhất.",
              },
              {
                step: "03",
                icon: UsersIcon,
                title: "Cộng tác nhóm",
                desc: "Chia sẻ và phân quyền cho đội ngũ để cùng theo dõi và đưa ra quyết định.",
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="text-center">
                  <span className="flex mx-auto size-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                    {item.step}
                  </span>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Icon className="size-5 text-muted-foreground" />
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Khách hàng nói gì</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Được yêu thích bởi hàng trăm đội ngũ
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border bg-background/60">
                <CardContent className="pt-6">
                  <div className="flex gap-1 text-revenue-positive">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className="size-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t pt-4">
                    <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Bảng giá</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Gói dịch vụ phù hợp với mọi quy mô
            </h2>
            <p className="mt-4 text-muted-foreground">
              Chọn gói phù hợp nhất với nhu cầu của doanh nghiệp bạn.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pricing.map((plan) => (
              <Card
                key={plan.name}
                className={`relative border bg-background/60 ${
                  plan.popular ? "ring-2 ring-primary shadow-lg" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Phổ biến nhất
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <p className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-revenue-positive" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button asChild className="mt-6 w-full" variant={plan.popular ? "default" : "outline"}>
                    <Link href="/dashboard">
                      {plan.price === "Liên hệ" ? "Liên hệ ngay" : "Dùng thử miễn phí"}
                      <ChevronRightIcon data-icon="inline-end" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Câu hỏi thường gặp
            </h2>
            <p className="mt-4 text-muted-foreground">
              Những thắc mắc phổ biến nhất về hệ thống của chúng tôi.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border bg-background/60 p-4 open:bg-background/80"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium">
                  {faq.q}
                  <ChevronRightIcon className="size-4 shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-muted-foreground">
              Sẵn sàng bắt đầu?
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Từ landing vào dashboard chỉ trong một bước duy nhất.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Dùng thử miễn phí 14 ngày, không cần thẻ tín dụng.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard">
              Khám phá báo cáo
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="flex size-8 items-center justify-center rounded-4xl bg-primary text-primary-foreground">
                  <BarChart3Icon className="size-3.5" />
                </span>
                Hệ thống Doanh thu
              </Link>
              <p className="mt-3 text-xs text-muted-foreground">
                Giải pháp quản lý doanh thu toàn diện cho doanh nghiệp Việt.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Sản phẩm</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Tính năng</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Bảng giá</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Công ty</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Tuyển dụng</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Hỗ trợ</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Liên hệ</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Điều khoản dịch vụ</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
            &copy; 2026 Hệ thống Doanh thu. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>
    </main>
  )
}
