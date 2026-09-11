import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const tLogo = useTranslations();

  const links = [
    {
      href: 'https://www.reddit.com/r/Kharita/',
      label: t('links.reddit'),
      external: true,
    },
    { href: '#support', label: t('links.supportUs'), external: false },
    { href: '#privacy', label: t('links.privacy'), external: false },
  ];

  return (
    <footer className="bg-black text-(--color-light)">
      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        {/* Mobile layout */}
        <div className="flex flex-col items-center gap-4 lg:hidden">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <Link
              href="/"
              className="inline-block text-xl font-extrabold tracking-tight transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95"
            >
              KHARITA
            </Link>
            <div className="text-center text-sm">
              © {new Date().getFullYear()} {tLogo('logo')} - {t('phrase')}
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="inline-block transition-all duration-150 hover:-translate-y-0.5 hover:underline hover:decoration-3 hover:underline-offset-10 active:translate-y-0.5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex lg:items-center lg:justify-between">
          <Link
            href="/"
            className="inline-block text-xl font-extrabold tracking-tight transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95"
          >
            KHARITA
          </Link>
          <div className="text-center text-sm">
            © {new Date().getFullYear()} {tLogo('logo')} - {t('phrase')}
          </div>
          <div className="flex gap-4 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="inline-block transition-all duration-150 hover:-translate-y-0.5 hover:underline hover:decoration-3 hover:underline-offset-10 active:translate-y-0.5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
