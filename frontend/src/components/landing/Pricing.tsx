import { CheckCircleIcon, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PricingItem } from '@/lib/services/landing.service';
import { pricing as defaultPricing } from './data/pricing';

interface PricingProps {
  items?: PricingItem[];
  isLoading?: boolean;
}

export function Pricing({ items, isLoading = false }: PricingProps) {
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
            popular: plan.popular === 1 || (plan.popular as unknown) === true,
          };
        })
      : defaultPricing;

  return (
    <section id="pricing" className="relative border-t border-white/5 grid-pattern">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5">
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
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border border-white/5 bg-white/[0.01] animate-pulse">
                  <CardHeader className="space-y-3">
                    <Skeleton className="h-6 w-24 rounded-md bg-white/10" />
                    <Skeleton className="h-4 w-full rounded-md bg-white/10" />
                    <div className="flex items-baseline gap-1 pt-2">
                      <Skeleton className="h-8 w-20 rounded-md bg-white/10" />
                      <Skeleton className="h-4 w-12 rounded-md bg-white/10" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <Skeleton className="size-4 rounded-full bg-white/10 shrink-0" />
                          <Skeleton className="h-4 w-4/5 rounded-md bg-white/10" />
                        </li>
                      ))}
                    </ul>
                    <Skeleton className="h-10 w-full rounded-lg bg-white/10" />
                  </CardContent>
                </Card>
              ))
            : displayPricing.map((plan, i) => (
                <Card
                  key={plan.name}
                  className={`relative border border-white/5 bg-white/[0.02] transition-all duration-500 animate-fade-in ${
                    plan.popular
                      ? 'ring-1 ring-primary/50 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] scale-105 hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.2)]'
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
                          <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-chart-2" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className={`mt-6 w-full transition-all duration-300 ${
                        plan.popular
                          ? 'shadow-lg shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]'
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
