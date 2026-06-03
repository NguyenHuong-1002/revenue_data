import { CheckCircleIcon, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pricing as defaultPricing } from './data/pricing';
import { PricingItem } from '@/lib/services/landing.service';

interface PricingProps {
  items?: PricingItem[];
}

export function Pricing({ items }: PricingProps) {
  const displayPricing =
    items && items.length > 0
      ? items.map((plan) => {
          let parsedFeatures: string[] = [];
          try {
            parsedFeatures =
              typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
          } catch {
            parsedFeatures = plan.features
              ? String(plan.features)
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];
          }
          return {
            name: plan.name,
            price: plan.price,
            period: plan.period,
            description: plan.description,
            features: parsedFeatures,
            popular: plan.popular === 1 || (plan.popular as any) === true,
          };
        })
      : defaultPricing;

  return (
    <section id="pricing" className="relative border-t border-white/5 grid-pattern">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-400 bg-blue-500/5">
            Bảng giá
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Gói dịch vụ phù hợp với <span className="gradient-text">mọi quy mô</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Chọn gói phù hợp nhất với nhu cầu của doanh nghiệp bạn.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {displayPricing.map((plan, i) => (
            <Card
              key={plan.name}
              className={`relative border border-white/5 bg-white/[0.02] transition-all duration-500 animate-fade-in ${
                plan.popular
                  ? 'ring-1 ring-primary/50 shadow-[0_0_40px_rgba(96,165,250,0.1)] scale-105 hover:shadow-[0_0_60px_rgba(96,165,250,0.2)]'
                  : 'hover:bg-white/[0.04] hover:-translate-y-1'
              }`}
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary hover:bg-primary">
                  Phổ biến nhất
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <p className="mt-4">
                  <span className="text-3xl font-bold gradient-text">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`mt-6 w-full transition-all duration-300 ${
                    plan.popular
                      ? 'shadow-lg shadow-primary/20 hover:shadow-primary/30'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Link href="/dashboard">
                    {plan.price === 'Liên hệ' ? 'Liên hệ ngay' : 'Dùng thử miễn phí'}
                    <ChevronRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
