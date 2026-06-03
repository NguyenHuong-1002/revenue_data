import { ChevronRightIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { faqs as defaultFaqs } from './data/faqs';
import { FaqItem } from '@/lib/landing-config';

interface FAQProps {
  items?: FaqItem[];
}

export function FAQ({ items }: FAQProps) {
  const displayFaqs =
    items && items.length > 0
      ? items.map((f) => ({ question: f.question, answer: f.answer }))
      : defaultFaqs.map((f) => ({ question: f.q, answer: f.a }));

  return (
    <section id="faq" className="border-t border-white/5">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <Badge variant="outline" className="mb-4 border-sky-500/30 text-sky-400 bg-sky-500/5">
            FAQ
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Câu hỏi thường gặp</h2>
          <p className="mt-4 text-muted-foreground">
            Những thắc mắc phổ biến nhất về hệ thống của chúng tôi.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {displayFaqs.map((faq, i) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 open:bg-white/[0.04] transition-all duration-300 hover:border-white/10 animate-fade-in"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium">
                {faq.question}
                <ChevronRightIcon className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-90 text-primary" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
