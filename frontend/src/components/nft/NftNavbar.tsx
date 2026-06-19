const NAV_LINKS = [
  { label: 'TRANG CHỦ', href: '/' },
  { label: 'VỀ CHÚNG TÔI', href: '/about' },
  { label: 'ĐĂNG NHẬP', href: '/auth/login' },
  { label: 'ĐĂNG KÍ', href: '/auth/register' },
];

export function NftNavbar() {
  return (
    <nav className="liquid-glass hidden rounded-[28px] px-[52px] py-[24px] lg:block">
      <ul className="flex gap-8">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="font-display text-cream text-[13px] uppercase transition hover:text-neon"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
