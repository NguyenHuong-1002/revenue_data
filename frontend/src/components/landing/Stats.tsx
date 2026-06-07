import { Badge } from '@/components/ui/badge';
import { StatItem } from '@/lib/landing-config';
import { stats as defaultStats } from './data/stats';

interface StatsProps {
  items?: StatItem[];
}

export function Stats({ items }: StatsProps) {
  const displayStats = items && items.length > 0 ? items : defaultStats;

  return (
    <section id="stats" className="relative border-t border-white/5 grid-pattern">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <Badge
            variant="outline"
            className="mb-4 border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
          >
            Con số
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Được tin dùng bởi hàng ngàn doanh nghiệp
          </h2>
          <p className="mt-4 text-muted-foreground">
            Những con số biết nói từ cộng đồng người dùng của chúng tôi.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <p className="text-4xl font-bold tracking-tight gradient-text">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
