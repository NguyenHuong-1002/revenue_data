import { Mail, Globe, Code } from 'lucide-react';

const SOCIAL_ICONS = [Mail, Globe, Code];

export function SocialIconsDesktop() {
  return (
    <div className="absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 lg:flex flex-col gap-4">
      {SOCIAL_ICONS.map((Icon, i) => (
        <button
          key={i}
          className="liquid-glass flex h-14 w-14 items-center justify-center rounded-[1rem] transition hover:bg-white/10"
        >
          <Icon className="h-5 w-5 text-cream" />
        </button>
      ))}
    </div>
  );
}

export function SocialIconsMobile() {
  return (
    <div className="mt-8 flex justify-center gap-4 lg:hidden">
      {SOCIAL_ICONS.map((Icon, i) => (
        <button
          key={i}
          className="liquid-glass flex h-14 w-14 items-center justify-center rounded-[1rem] transition hover:bg-white/10"
        >
          <Icon className="h-5 w-5 text-cream" />
        </button>
      ))}
    </div>
  );
}

export function SocialIconsVertical() {
  return (
    <div className="liquid-glass flex flex-col rounded-[0.5rem] sm:rounded-[1rem] lg:rounded-[1.25rem]">
      {SOCIAL_ICONS.map((Icon, i, arr) => (
        <div key={i}>
          <button className="flex w-[14vw] items-center justify-center py-4 sm:w-[14.375rem] sm:py-6 md:w-[10.78125rem] md:py-8 lg:w-[16.77rem]">
            <Icon className="h-5 w-5 text-cream sm:h-6 sm:w-6" />
          </button>
          {i < arr.length - 1 && <div className="border-b border-white/10" />}
        </div>
      ))}
    </div>
  );
}
