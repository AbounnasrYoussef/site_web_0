'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/app/(zguellou)/providers/AuthProvider';
import FullButton from './full-button';
import IconButton from './icon-button';
import LanguageIcon from '@/public/icons/navbar/LanguageIcon';
import BellIcon from '@/public/icons/navbar/BellIcon';

type AuthStatus = 'loading' | 'signed-out' | 'signed-in';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
];

export default function Navbar() {
  const { user, isLoading } = useAuth();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('navbar');

  const isActiveRoute = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
        setMobileMenuOpen(false);
        setNotificationsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const authStatus: AuthStatus = isLoading ? 'loading' : user ? 'signed-in' : 'signed-out';

  const cta = useMemo(() => {
    if (authStatus === 'signed-in') {
      return { label: t('profile'), href: '/profile' };
    }
    return { label: t('getStarted'), href: '/register' };
  }, [authStatus, t]);

  const handleLanguageChange = (code: string) => {
    document.cookie = `locale=${code}; path=/; max-age=31536000`;
    setLanguageMenuOpen(false);
    setMobileMenuOpen(false);
    window.location.href = pathname;
  };

  return (
    <div ref={menuRef} className="relative">
      <header
        className={`border-2 border-x-0 border-t-0 border-(--color-text) bg-(--color-surface) ${mobileMenuOpen ? '' : 'shadow-[4px_4px_0_0_var(--color-text)]'
          }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            KHARITA
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            <Link
              href="/map"
              className={`text-sm font-medium underline decoration-3 underline-offset-10 transition-all duration-150 ${isActiveRoute('/map')
                  ? '-translate-y-0.5 decoration-(--color-text) text-(--color-text)'
                  : 'decoration-transparent hover:-translate-y-0.5 hover:text-(--color-text) hover:decoration-(--color-text)'
                }`}
            >
              {t('links.map')}
            </Link>

            <Link
              href="/universities"
              className={`text-sm font-medium underline decoration-3 underline-offset-10 transition-all duration-150 ${isActiveRoute('/universities')
                  ? '-translate-y-0.5 decoration-(--color-text) text-(--color-text)'
                  : 'decoration-transparent hover:-translate-y-0.5 hover:text-(--color-text) hover:decoration-(--color-text)'
                }`}
            >
              {t('links.universities')}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user &&
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotificationsMenuOpen((open) => !open)}
                className={`
                  grid h-10 w-10 cursor-pointer place-items-center
                  border-2 hover:bg-(--color-light)
                  ${notificationsMenuOpen
                    ? 'border-(--color-text) rounded-none'
                    : 'border-transparent hover:border-(--color-text)'
                  }
                `}
              >
                <BellIcon aria-hidden="true" width={23} height={23} />
              </button>
            }

            <FullButton href={cta.href} text={cta.label} backgroundColor="var(--color-accent-soft)" className="justify-center" />

            <div className="hidden md:block">
              <div className={`relative ${languageMenuOpen ? 'shadow-[2px_2px_0_0_var(--color-text)]' : ''}`}>
                <button
                  type="button"
                  aria-label="Change language"
                  onClick={() => setLanguageMenuOpen((open) => !open)}
                  className={`
                    grid h-10 w-10 cursor-pointer place-items-center
                    border-2 hover:bg-(--color-light)
                    ${languageMenuOpen
                      ? 'border-(--color-text) border-b-transparent rounded-none'
                      : 'border-transparent hover:border-(--color-text)'
                    }
                  `}
                >
                  <LanguageIcon aria-hidden="true" width={23} height={23} />
                </button>

                {languageMenuOpen && (
                  <div className="absolute top-[calc(100%-2px)] left-0 min-w-full w-auto overflow-hidden border-2 border-(--color-text) bg-(--color-surface) shadow-[2px_2px_0_0_var(--color-text)]">
                    {LANGUAGES.map((language, index) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`
                          cursor-pointer block w-full p-2 text-center text-sm transition-colors
                          hover:bg-(--color-accent-soft)
                          ${locale === language.code ? 'font-extrabold' : 'font-medium'}
                          ${index !== LANGUAGES.length - 1 ? 'border-b-2 border-(--color-text)' : ''}
                        `}
                      >
                        {language.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <IconButton
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle mobile menu"
              aria-pressed={mobileMenuOpen}
              backgroundColor="var(--color-surface)"
              className="md:hidden"
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span
                  className={`absolute h-0.5 w-5 bg-(--color-text) transition-transform duration-200 ${mobileMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5'
                    }`}
                />
                <span
                  className={`absolute h-0.5 w-5 bg-(--color-text) transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                />
                <span
                  className={`absolute h-0.5 w-5 bg-(--color-text) transition-transform duration-200 ${mobileMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5'
                    }`}
                />
              </span>
            </IconButton>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-18 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 right-0 top-18 z-50 border-b-2 border-(--color-text) bg-(--color-surface) shadow-[4px_4px_0_0_var(--color-text)]">
            <div className="flex flex-col gap-4 p-6">
              <IconButton
                href="/map"
                onClick={() => setMobileMenuOpen(false)}
                backgroundColor={isActiveRoute('/map') ? 'var(--color-accent-soft)' : 'var(--color-surface)'}
                hoverBackgroundColor="var(--color-accent-soft)"
                active={true}
                animated={false}
                className="w-full justify-start px-4 text-lg font-semibold"
              >
                {t('links.map')}
              </IconButton>

              <IconButton
                href="/universities"
                onClick={() => setMobileMenuOpen(false)}
                backgroundColor={isActiveRoute('/universities') ? 'var(--color-accent-soft)' : 'var(--color-surface)'}
                hoverBackgroundColor="var(--color-accent-soft)"
                active={true}
                animated={false}
                className="w-full justify-start px-4 text-lg font-semibold"
              >
                {t('links.universities')}
              </IconButton>

              <div className="mt-2 border-t-2 border-(--color-text) pt-4">
                <p className="mb-3 text-sm font-bold">Language</p>
                <div className="flex gap-2">
                  {LANGUAGES.map((language) => (
                    <IconButton
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      backgroundColor={
                        locale === language.code
                          ? 'var(--color-accent-soft)'
                          : 'var(--color-surface)'
                      }
                      hoverBackgroundColor="var(--color-accent-soft)"
                      active={locale === language.code}
                      animated={true}
                      className="font-bold"
                    >
                      {language.label}
                    </IconButton>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}