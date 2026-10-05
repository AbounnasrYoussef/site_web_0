'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/app/(zguellou)/providers/AuthProvider';
import FullButton from './full-button';
import IconButton from './icon-button';
import LanguageIcon from '@/public/icons/navbar/LanguageIcon';
import BellIcon from '@/public/icons/navbar/BellIcon';
import FirstNameIcon from '@/public/icons/auth/label/FirstNameIcon';
import LogoutIcon from '@/public/icons/auth/LogoutIcon';
import Logo from './logo';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
];

export default function Navbar() {
  const { user, clearAuth } = useAuth();
  const router = useRouter();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('navbar');

  const isActiveRoute = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isAuthPage = ['/reset-password', '/2fa-revoke', '/force-change-password'].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

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
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLanguageChange = (code: string) => {
    document.cookie = `locale=${code}; path=/; max-age=31536000`;
    setLanguageMenuOpen(false);
    setMobileMenuOpen(false);
    window.location.href = pathname + window.location.search;
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div ref={menuRef} className="relative z-998">
      <header
        className={`border-2 border-x-0 border-t-0 border-(--color-text) bg-(--color-surface) ${
          mobileMenuOpen ? '' : 'shadow-[4px_4px_0_0_var(--color-text)]'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="shrink-0"
          >
            <Logo priority className="h-9 w-auto sm:h-11" />
          </Link>

          {!isAuthPage && (
            <nav className="hidden items-center gap-10 md:flex">
              <Link
                href="/path"
                className={`text-sm font-medium underline decoration-3 underline-offset-10 transition-all duration-150 ${
                  isActiveRoute('/path')
                    ? '-translate-y-0.5 decoration-(--color-text) text-(--color-text)'
                    : 'decoration-transparent hover:-translate-y-0.5 hover:text-(--color-text) hover:decoration-(--color-text)'
                }`}
              >
                {t('links.path')}
              </Link>

              <Link
                href="/universities"
                className={`text-sm font-medium underline decoration-3 underline-offset-10 transition-all duration-150 ${
                  isActiveRoute('/universities')
                    ? '-translate-y-0.5 decoration-(--color-text) text-(--color-text)'
                    : 'decoration-transparent hover:-translate-y-0.5 hover:text-(--color-text) hover:decoration-(--color-text)'
                }`}
              >
                {t('links.universities')}
              </Link>
              <Link
                href="/chatbot"
                className={`text-sm font-medium underline decoration-3 underline-offset-10 transition-all duration-150 ${
                  isActiveRoute('/chatbot')
                    ? '-translate-y-0.5 decoration-(--color-text) text-(--color-text)'
                    : 'decoration-transparent hover:-translate-y-0.5 hover:text-(--color-text) hover:decoration-(--color-text)'
                }`}
              >
                {t('links.chatbot')}
            </Link>
            </nav>
          )}

          <div className="flex items-center gap-3">
            {/* ── Guest: Get Started (all screens) ── */}
            {!isAuthPage && !user && (
              <>
              <FullButton
                href="/login"
                isActive={isActiveRoute('/login')}
                text={t('login')}
                backgroundColor="var(--color-accent-soft)"
                className="justify-center"
              />
              <FullButton
                href="/register"
                isActive={isActiveRoute('/register')}
                text={t('getStarted')}
                backgroundColor="var(--color-highlight)"
                className="justify-center"
              />
              </>
            )}

            {/* ── Admin: Dashboard FullButton (desktop only) ── */}
            {!isAuthPage && user && isAdmin && (
              <div className="hidden md:flex">
                <FullButton
                  href="/dashboard"
                  isActive={isActiveRoute('/dashboard')}
                  text={t('dashboard')}
                  backgroundColor="var(--color-accent-soft)"
                  className="justify-center"
                />
              </div>
            )}

            {/* ── Logged-in: Notifications bell (all screens) ── */}
            {!isAuthPage && user && (
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotificationsMenuOpen((open) => !open)}
                className={`
                  grid h-10 w-10 cursor-pointer place-items-center
                  border-2 hover:bg-(--color-light)
                  ${
                    notificationsMenuOpen
                      ? 'border-(--color-text) rounded-none'
                      : 'border-transparent hover:border-(--color-text)'
                  }
                `}
              >
                <BellIcon aria-hidden="true" width={23} height={23} />
              </button>
            )}

            {/* ── Logged-in: Profile + Logout icons (desktop only) ── */}
            {!isAuthPage && user && (
              <>
                <button
                  type="button"
                  aria-label="Profile"
                  onClick={() => router.push('/profile')}
                  className={`
                    hidden md:grid h-10 w-10 cursor-pointer place-items-center
                    border-2 hover:bg-(--color-accent-soft)
                    ${
                      isActiveRoute('/profile')
                        ? 'border-(--color-text) rounded-none'
                        : 'border-transparent hover:border-(--color-text)'
                    }
                  `}
                >
                  <FirstNameIcon aria-hidden="true" width={23} height={23} />
                </button>

                <button
                  type="button"
                  aria-label="Logout"
                  onClick={() => void clearAuth()}
                  className="hidden md:grid h-10 w-10 cursor-pointer place-items-center border-2 border-transparent hover:border-(--color-text) hover:bg-(--color-error-light) pl-1"
                >
                  <LogoutIcon width={23} height={23} aria-hidden="true" />
                </button>
              </>
            )}

            {/* ── Language dropdown (desktop only) ── */}
            <div className="hidden md:block">
              <div
                className={`relative ${
                  languageMenuOpen ? 'shadow-[2px_2px_0_0_var(--color-text)]' : ''
                }`}
              >
                <button
                  type="button"
                  aria-label="Change language"
                  onClick={() => setLanguageMenuOpen((open) => !open)}
                  className={`
                    grid h-10 w-10 cursor-pointer place-items-center
                    border-2 hover:bg-(--color-light)
                    ${
                      languageMenuOpen
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

            {/* ── Hamburger (mobile only) ── */}
            <IconButton
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle mobile menu"
              aria-pressed={mobileMenuOpen}
              backgroundColor="var(--color-surface)"
              className="md:hidden"
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <span
                  className={`absolute h-0.5 w-5 bg-(--color-text) transition-transform duration-200 ${
                    mobileMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5'
                  }`}
                />
                <span
                  className={`absolute h-0.5 w-5 bg-(--color-text) transition-opacity duration-200 ${
                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute h-0.5 w-5 bg-(--color-text) transition-transform duration-200 ${
                    mobileMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5'
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
            className="fixed inset-0 top-18 z-40 bg-black/60"
            onClick={closeMobileMenu}
          />
          <div className="fixed left-0 right-0 z-50 border-b-2 border-(--color-text) bg-(--color-surface) shadow-[4px_4px_0_0_var(--color-text)]">
            <div className="flex flex-col gap-4 p-6">
              <IconButton
                href="/path"
                onClick={closeMobileMenu}
                backgroundColor={
                  isActiveRoute('/path') ? 'var(--color-accent-soft)' : 'var(--color-surface)'
                }
                hoverBackgroundColor="var(--color-accent-soft)"
                active={true}
                animated={false}
                className="w-full justify-start px-4 text-lg font-semibold"
              >
                {t('links.path')}
              </IconButton>

              <IconButton
                href="/universities"
                onClick={closeMobileMenu}
                backgroundColor={
                  isActiveRoute('/universities')
                    ? 'var(--color-accent-soft)'
                    : 'var(--color-surface)'
                }
                hoverBackgroundColor="var(--color-accent-soft)"
                active={true}
                animated={false}
                className="w-full justify-start px-4 text-lg font-semibold"
              >
                {t('links.universities')}
              </IconButton>

              <IconButton
                  href="/chatbot"
                  onClick={closeMobileMenu}
                  backgroundColor={
                    isActiveRoute('/chatbot')
                      ? 'var(--color-accent-soft)'
                      : 'var(--color-surface)'
                  }
                  hoverBackgroundColor="var(--color-accent-soft)"
                  active={true}
                  animated={false}
                  className="w-full justify-start px-4 text-lg font-semibold"
                >
                  {t('links.chatbot')}
              </IconButton>

              {/* ── Logged-in: Profile + Logout + Dashboard IconButtons (mobile) ── */}
              {!isAuthPage && user && (
                <>
                  {isAdmin && (
                    <IconButton
                      href="/dashboard"
                      onClick={closeMobileMenu}
                      backgroundColor={
                        isActiveRoute('/dashboard')
                          ? 'var(--color-accent-soft)'
                          : 'var(--color-surface)'
                      }
                      hoverBackgroundColor="var(--color-accent-soft)"
                      active={true}
                      animated={false}
                      className="w-full justify-start px-4 text-lg font-semibold"
                    >
                      <span className="flex items-center gap-3">
                        <span>{t('dashboard')}</span>
                      </span>
                    </IconButton>
                  )}
                  <IconButton
                    href="/profile"
                    onClick={closeMobileMenu}
                    backgroundColor={
                      isActiveRoute('/profile')
                        ? 'var(--color-accent-soft)'
                        : 'var(--color-surface)'
                    }
                    hoverBackgroundColor="var(--color-accent-soft)"
                    active={true}
                    animated={false}
                    className="w-full justify-start px-4 text-lg font-semibold"
                  >
                      <span>{t('profile')}</span>
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      closeMobileMenu();
                      void clearAuth();
                    }}
                    backgroundColor="var(--color-surface)"
                    hoverBackgroundColor="var(--color-error)"
                    active={true}
                    animated={false}
                    className="w-full justify-start px-4 text-lg font-semibold"
                  >
                      <span>{t('logout')}</span>
                  </IconButton>
                </>
              )}

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