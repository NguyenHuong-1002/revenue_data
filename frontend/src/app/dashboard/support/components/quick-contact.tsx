import { Brain, Mail, MessageSquare, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function QuickContact() {
  return (
    <Card className="border-border/50 shadow-xs p-5">
      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
        <MessageSquare className="h-4 w-4 text-indigo-500" />
        Liên hệ nhanh
      </h3>
      <div className="flex flex-col gap-3">
        <a
          href="/dashboard/chat"
          className="flex items-center justify-between p-2.5 rounded-lg border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-all text-xs font-semibold"
        >
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>Hỏi Trợ lý AI</span>
          </div>
          <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-sm">
            24/7
          </span>
        </a>

        <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/50 text-xs">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-muted-foreground">Hotline hỗ trợ</div>
            <div className="font-bold text-slate-700 dark:text-slate-200">+84 1900 8198</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/50 text-xs">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-muted-foreground">Email hỗ trợ</div>
            <div className="font-bold text-slate-700 dark:text-slate-200">
              support@system.com.vn
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
