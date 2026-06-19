'use client';

import { NftHero, NftAbout, NftCollection, NftCta } from '@/components/nft';

export default function Home() {
  return (
    <main className="bg-nft-bg min-h-screen">
      <div className="nft-texture-overlay" />
      <NftHero />
      <NftAbout />
      <NftCollection />
      <NftCta />
    </main>
  );
}
