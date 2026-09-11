import { getTranslations } from 'next-intl/server';
import TrajetCarousel from '@/components/TrajetCarousel';
import Image from 'next/image';
import ContactForm from '@/components/ContactForm';

export default async function Page() {
  const t = await getTranslations('home');

  return (
    <main className="min-h-screen text-(--color-text) squared-bg">
      <section className="relative mx-auto flex min-h-[calc(100vh-73px)] container flex-col justify-center px-6 sm:px-8">
        <div className="absolute top-8 left-4 w-16 h-16 bg-orange-400 border-2 border-(--color-text) rotate-3" />
        <div
          className="absolute top-64 right-24 hidden sm:block"
          style={{
            width: 0,
            height: 0,
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderTop: '32px solid var(--color-accent)',
          }}
        />
        <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full border-2 border-(--color-text) hidden sm:block" />

        <div className="self-start inline-block bg-(--color-accent-soft) border-2 border-(--color-text) px-4 py-1 mb-6 shadow-[4px_4px_0_0_var(--color-text)]">
          <span className="text-xs font-bold uppercase tracking-wide">
            {t('hero.badge')}
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black uppercase leading-tight">
          <span className="bg-(--color-accent-soft) px-2">{t('hero.titleLine1')}</span>
          <br />
          <span className="bg-(--color-text) text-(--color-bg) px-2">{t('hero.titleLine2')}</span>
        </h1>

        <div className="mt-8 max-w-2xl border-2 border-(--color-text) p-6 shadow-[4px_4px_0_0_var(--color-text)]">
          <p className="text-base sm:text-lg">{t('hero.description')}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button className="bg-(--color-accent-soft) border-2 border-(--color-text) px-6 py-3 font-bold uppercase shadow-[4px_4px_0_0_var(--color-text)] transition-all duration-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--color-text)]">
            {t('hero.enterGrid')} →
          </button>
          <a href="#contact" className="bg-(--color-surface) border-2 border-(--color-text) px-6 py-3 font-bold uppercase shadow-[4px_4px_0_0_var(--color-text)] transition-all duration-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--color-text)] inline-block">{t('hero.viewDossier')}</a>
        </div>
      </section>

      <hr className="border-t-4 border-(--color-text) w-full" />

      <section className="relative mx-auto container px-6 py-24 sm:px-8">
        <h2 className="text-4xl sm:text-5xl font-black uppercase mb-10">
          {t('trajet.title')}
        </h2>
        <TrajetCarousel />
      </section>

      <section className="relative overflow-hidden border-t-4 border-(--color-text)">
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-1/2 h-full bg-(--color-accent-soft)/10" />
        </div>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-stretch">
          <div className="border-b-4 md:border-b-0 md:border-r-4 border-(--color-text) p-10 md:p-20 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl">👥</span>
              <h2 className="text-3xl font-black uppercase">{t('about.title')}</h2>
            </div>

            <blockquote className="border-l-4 border-(--color-accent) pl-4 mb-8">
              <p className="text-xl font-bold">{t('about.quote')}</p>
            </blockquote>

            <p className="text-base text-(--color-muted) mb-8">
              {t('about.description')}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="border-2 border-(--color-text) px-4 py-2">
                <span className="font-mono text-sm">{t('about.members')}</span>
              </div>
              <div className="border-2 border-(--color-text) px-4 py-2">
                <span className="font-mono text-sm">{t('about.institutions')}</span>
              </div>
            </div>
          </div>

          <div className="p-10 md:p-16 flex items-center justify-center">
            <div className="relative border-2 border-(--color-text) w-full aspect-video shadow-[4px_4px_0_0_var(--color-text)]">
              <Image
                src="/images/swarm.png"
                alt="The Swarm - students collaborating"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <hr className="border-t-4 border-(--color-text) w-full" />

      <section id="contact" className="relative mx-auto container px-6 py-24 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="inline-block bg-(--color-accent-soft) border-2 border-(--color-text) px-4 py-1 mb-6 shadow-[4px_4px_0_0_var(--color-text)]">
              <span className="text-xs font-bold uppercase tracking-wide">
                {t('contact.badge')}
              </span>
            </div>

            <h2 className="text-5xl font-black uppercase leading-tight mb-6">
              {t('contact.titleLine1')}
              <br />
              {t('contact.titleLine2')}
            </h2>

            <div className="bg-(--color-accent-soft)/10 border-2 border-(--color-text) p-6 shadow-[4px_4px_0_0_var(--color-text)]">
              <p className="text-base">{t('contact.description')}</p>
            </div>
          </div>

          <ContactForm
            nameLabel={t('contact.nameLabel')}
            namePlaceholder={t('contact.namePlaceholder')}
            emailLabel={t('contact.emailLabel')}
            emailPlaceholder={t('contact.emailPlaceholder')}
            messageLabel={t('contact.messageLabel')}
            messagePlaceholder={t('contact.messagePlaceholder')}
            sendLabel={t('contact.send')}
          />
        </div>
      </section>
    </main>
  );
}