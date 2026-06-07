import { Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function SupportForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success(
      'Yêu cầu hỗ trợ của bạn đã được gửi đi! Đội ngũ kỹ thuật sẽ phản hồi trong vòng 24h.'
    );
    setForm({ name: '', email: '', message: '' });
    setSubmitting(false);
  };

  return (
    <Card className="border-border/50 shadow-xs relative overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Send className="h-4 w-4 text-indigo-500" />
          Gửi yêu cầu hỗ trợ
        </CardTitle>
        <CardDescription className="text-xs">
          Mô tả vấn đề của bạn để nhận sự trợ giúp sớm nhất.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">
              Họ và tên
            </label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nguyễn Văn A"
              className="rounded-lg h-9 text-xs"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
              Email nhận phản hồi
            </label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="email@company.com"
              className="rounded-lg h-9 text-xs"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="message" className="text-xs font-semibold text-muted-foreground">
              Nội dung sự cố
            </label>
            <Textarea
              id="message"
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Nhập chi tiết sự cố cần hỗ trợ..."
              rows={3}
              className="rounded-lg text-xs resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-9 cursor-pointer transition-all mt-1"
          >
            {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
