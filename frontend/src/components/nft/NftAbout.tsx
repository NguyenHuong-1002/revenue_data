const ABOUT_TEXT =
  'A digital object fixed beyond time and place. An exploration of distance, form, and silence in space';

export function NftAbout() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_151551_992053d1-3d3e-4b8c-abac-45f22158f411.mp4"
      />
      <div className="relative z-10 mx-auto max-w-[1831px] px-6 py-16 sm:px-10 sm:py-20 md:px-16 md:py-24 lg:px-24 lg:py-24">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="relative">
            <h2 className="font-display text-cream text-[32px] uppercase leading-tight sm:text-[40px] md:text-[50px] lg:text-[60px]">
              Hello!
              <br />
              I&apos;m orbis
            </h2>
          </div>
          <p className="font-mono max-w-[266px] text-[14px] uppercase text-cream sm:text-[16px]">
            {ABOUT_TEXT}
          </p>
        </div>

        <div className="mt-16 flex justify-between lg:mt-32">
          <div className="flex flex-col gap-4 opacity-10">
            <p className="font-mono max-w-[266px] text-[14px] uppercase text-cream sm:text-[16px]">
              {ABOUT_TEXT}
            </p>
            <p className="font-mono max-w-[266px] text-[14px] uppercase text-cream sm:text-[16px]">
              {ABOUT_TEXT}
            </p>
          </div>
          <div className="hidden flex-col gap-4 opacity-10 lg:flex">
            <p className="font-mono max-w-[266px] text-[14px] uppercase text-cream sm:text-[16px]">
              {ABOUT_TEXT}
            </p>
            <p className="font-mono max-w-[266px] text-[14px] uppercase text-cream sm:text-[16px]">
              {ABOUT_TEXT}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
