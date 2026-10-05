import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

// Arabic gets the "خ" mark, English and French share the "KH" mark.
export const brandDir = (locale: string) => (locale === 'ar' ? 'ar' : 'en');

const WORDMARK_SIZE = {
  en: { width: 718, height: 240 },
  ar: { width: 598, height: 240 },
};

type LogoProps = {
  variant?: 'wordmark' | 'icon';
  className?: string;
  priority?: boolean;
};

export default function Logo({ variant = 'wordmark', className, priority }: LogoProps) {
  const locale = useLocale();
  const t = useTranslations();
  const dir = brandDir(locale);

  if (variant === 'icon') {
    return (
      <Image
        src={`/brand/${dir}/icon-192.png`}
        alt={t('logo')}
        width={192}
        height={192}
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={`/brand/${dir}/wordmark.png`}
      alt={t('logo')}
      {...WORDMARK_SIZE[dir]}
      className={className}
      priority={priority}
    />
  );
}
