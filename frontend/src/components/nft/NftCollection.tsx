import { ChevronRight } from 'lucide-react';

const NFT_CARDS = [
  {
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_053923_22c0a6a5-313c-474c-85ff-3b50d25e944a.mp4',
    score: '8.7/10',
  },
  {
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_054411_511c1b7a-fb2f-42ef-bf6c-32c0b1a06e79.mp4',
    score: '9/10',
  },
  {
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055427_ac7035b5-9f3b-4289-86fc-941b2432317d.mp4',
    score: '8.2/10',
  },
];

export function NftCollection() {
  return (
    <section className="bg-nft-bg py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-[1831px] px-6 sm:px-10 md:px-16 lg:px-24">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-cream text-[32px] uppercase leading-tight sm:text-[40px] md:text-[50px] lg:text-[60px]">
              Collection of
              <br />
              <span className="ml-12 sm:ml-24 md:ml-32">
                <span className="font-display text-neon normal-case">Space </span>
                objects
              </span>
            </h2>
          </div>
          <div className="group cursor-pointer">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-cream text-[32px] uppercase sm:text-[40px] md:text-[50px] lg:text-[60px]">
                SEE
              </span>
              <span className="font-display text-cream flex flex-col text-[20px] uppercase leading-tight sm:text-[28px] md:text-[32px] lg:text-[36px]">
                <span>ALL</span>
                <span>CREATORS</span>
              </span>
            </div>
            <div className="mt-2 h-[6px] w-full bg-neon sm:h-[8px] md:h-[10px]" />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {NFT_CARDS.map((card, i) => (
            <div
              key={i}
              className="liquid-glass group rounded-[32px] p-[18px] transition hover:bg-white/10"
            >
              <div className="relative overflow-hidden rounded-[24px] pb-[100%]">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                  src={card.video}
                />
              </div>
              <div className="liquid-glass relative -mt-12 z-10 mx-4 mb-4 rounded-[20px] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[11px] uppercase text-cream/70">
                      RARITY SCORE:
                    </span>
                    <span className="font-display ml-2 text-[16px] text-cream">
                      {card.score}
                    </span>
                  </div>
                  <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#b724ff] to-[#7c3aed] shadow-lg shadow-purple-500/50 transition hover:scale-110">
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
