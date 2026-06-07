import { Search } from 'lucide-react';

interface SupportBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SupportBanner({ searchQuery, setSearchQuery }: SupportBannerProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Trung tâm hỗ trợ
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Tìm kiếm câu hỏi thường gặp hoặc gửi yêu cầu trợ giúp trực tiếp cho kỹ thuật viên.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto md:max-w-md">
        {/* Search input */}
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-background text-foreground placeholder-muted-foreground rounded-lg border border-input focus:outline-none focus:ring-1 focus:ring-ring text-sm transition-all shadow-xs"
          />
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg shrink-0 text-xs font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hệ thống bình thường</span>
        </div>
      </div>
    </div>
  );
}
