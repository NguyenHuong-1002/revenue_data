import { NftHero } from '@/components/nft/NftHero';
import { NftAbout } from '@/components/nft/NftAbout';
import { NftCollection } from '@/components/nft/NftCollection';
import { NftCta } from '@/components/nft/NftCta';

export const metadata = {
  title: 'Orbis.Nft - Beyond Earth',
  description: 'NFT Collection - A digital object fixed beyond time and place',
};

export default function NftPage() {
  return (
    <main className="min-h-screen bg-[#010828]">
      {/* Texture Overlay */}
      <div className="nft-texture-overlay" />

      <NftHero />
      <NftAbout />
      <NftCollection />
      <NftCta />
    </main>
  );
}
