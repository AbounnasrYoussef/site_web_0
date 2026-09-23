import Navbar from '@/components/navbar';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="flex-1 flex flex-col h-screen">
        <div className="float-shapes hidden sm:block" aria-hidden="true">
          <div className="float-shape float-shape--square" />
          <div className="float-shape float-shape--circle" />
        </div>

      <main className=" squared-bg flex-1 flex items-center justify-center bg-(--color-bg) px-4 text-(--color-text)">
        <div className="text-center">
          <h1 className="text-7xl font-black tracking-tight sm:text-8xl">404</h1>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t('title')}</h2>
          <p className="mt-2 text-lg text-(--color-muted) sm:text-xl">
            {t('description')}
          </p>
          <Link
            href="/"
            className="uppercase bg-(--color-bg) mt-6 inline-block border-2 border-(--color-text) px-6 py-3 font-semibold shadow-[4px_4px_0_0_var(--color-text)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--color-text)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            {t('home')}
          </Link>
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata() {
  const t = await getTranslations('notFound');
  return {
    title: t('title'),
    description: t('description'),
    robots: 'noindex, follow',
  };
}
