import { SocialIconsDesktop, SocialIconsMobile } from './SocialIcons';
import { NftNavbar } from './NftNavbar';

export function NftHero() {
  return (
    <section className="relative min-h-screen overflow-hidden rounded-b-[32px]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4"
      />
      <div className="relative z-10 mx-auto max-w-[1831px] px-6 py-6 sm:px-10 md:px-16 lg:px-24">
        <header className="flex items-center justify-between">
          <span className="font-display text-cream text-sm uppercase tracking-wider">
            Dashboard
          </span>
          <NftNavbar />
          <div className="w-20 lg:w-0" />
        </header>

        <div className="mt-24 md:mt-32 lg:mt-40">
          <div className="relative max-w-[780px] lg:ml-32">
            <h1 className="font-display text-cream text-[40px] uppercase leading-[1.05] sm:text-[60px] sm:leading-[1] md:text-[75px] lg:text-[90px]">
              Beyond earth
              <br />
              and ( its ) familiar boundaries
            </h1>
          </div>
          <SocialIconsMobile />
        </div>

        <SocialIconsDesktop />
      </div>
    </section>
  );
}
