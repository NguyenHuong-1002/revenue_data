import { SocialIconsVertical } from './SocialIcons';

export function NftCta() {
  return (
    <section className="relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="block h-auto w-full"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055729_72d66327-b59e-4ae9-bb70-de6ccb5ecdb0.mp4"
      />
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto max-w-[1831px] px-6 sm:px-10 md:px-16 lg:px-24">
          <div className="ml-auto max-w-[600px] lg:pr-[20%] lg:pl-[15%]">
            <h2 className="font-display text-cream text-[16px] uppercase leading-tight sm:text-[24px] md:text-[36px] lg:text-[60px]">
              <span className="mb-4 block sm:mb-6 md:mb-8 lg:mb-12">JOIN US.</span>
              REVEAL WHAT&apos;S HIDDEN.
              <br />
              DEFINE WHAT&apos;S NEXT.
              <br />
              FOLLOW THE SIGNAL.
            </h2>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[12%] left-[8%] lg:bottom-[20%]">
        <SocialIconsVertical />
      </div>
    </section>
  );
}
