import { StarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TestimonialItem } from '@/lib/services/landing.service';
import { testimonials as defaultTestimonials } from './data/testimonials';

interface TestimonialsProps {
  items?: TestimonialItem[];
  isLoading?: boolean;
}

export function Testimonials({ items, isLoading = false }: TestimonialsProps) {
  const displayTestimonials = items && items.length > 0 ? items : defaultTestimonials;

  return (
    <section className="border-t border-zinc-200 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <Badge variant="outline" className="mb-4 border-rose-500/30 text-rose-400 bg-rose-500/5">
            Khách hàng nói gì
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Được yêu thích bởi hàng trăm đội ngũ
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border border-white/5 bg-white/[0.01] animate-pulse">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Skeleton key={j} className="size-4 rounded-md bg-white/10" />
                      ))}
                    </div>
                    <Skeleton className="h-4 w-full rounded-md bg-white/10" />
                    <Skeleton className="h-4 w-5/6 rounded-md bg-white/10" />
                    <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
                      <Skeleton className="size-9 rounded-full bg-white/10" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-24 rounded-md bg-white/10" />
                        <Skeleton className="h-3 w-16 rounded-md bg-white/10" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : displayTestimonials.map((t, i) => (
                <Card
                  key={t.name}
                  className="group border border-zinc-200 bg-zinc-50/30 hover:bg-zinc-50/80 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className="size-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="mt-6 flex items-center gap-3 border-t border-zinc-200 dark:border-white/5 pt-4">
                      <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
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
  );
}
