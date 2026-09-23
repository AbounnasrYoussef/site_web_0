'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import FullButton from '@/components/full-button';
import ArrowRightIcon from '@/public/icons/auth/ArrowRight';

export default function TwoFactorRevokePage() {
  const t = useTranslations('verify2fa');
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRevoke = async () => {
    if (!token) {
      setError(t('errors.missingToken'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/2fa/revoke-all`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ pending_token: token }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || t('errors.generic'));
      }

      if (data.requires_password_change && data.pending_token) {
        sessionStorage.setItem('force_change_token', data.pending_token);
        router.push(`/force-change-password?token=${data.pending_token}`);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Missing token state (still uses the same shell) ──
  if (!token) {
    return (
      <div className="flex-1 dotted-bg flex items-center justify-center p-4 overflow-hidden">
        <div className="container flex justify-center">
          <div className="glow-corners w-full sm:max-w-[70%] lg:max-w-[50%]">
            <div className="bg-(--color-surface) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)]">

              <div className="bg-(--color-error-light) border-b-[3px] border-b-black p-6 sm:p-8">
                <h1 className="uppercase font-black leading-none tracking-tight text-4xl sm:text-6xl lg:text-7xl">
                  {t('revoke.title')}
                </h1>
              </div>

              <div className="p-6 sm:p-8">
                <div className="border-2 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-700 shadow-[2px_2px_0_0_red]">
                  {t('errors.missingToken')}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal / success state ──
  return (
    <div className="flex-1 dotted-bg flex items-center justify-center p-4 overflow-hidden">
      <div className="container flex justify-center">
        <div className="float-shapes hidden sm:block" aria-hidden="true">
          <div className="float-shape float-shape--square" />
          <div className="float-shape float-shape--circle" />
        </div>

        <div className="w-full sm:max-w-[70%] lg:max-w-[50%]">
          <div className="bg-(--color-surface) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)]">

            {/* ── Header ── */}
            <div className="bg-(--color-error-light) border-b-[3px] border-b-black p-6 sm:p-8">
              <h1 className="uppercase font-black leading-none tracking-tight text-4xl sm:text-6xl lg:text-7xl">
                {success ? t('revoke.successTitle') : t('revoke.title')}
              </h1>
              <p className="mt-6 uppercase text-xs tracking-[0.25em] font-mono">
                {t('revoke.kicker')}
              </p>
            </div>

            {/* ── Body ── */}
            <div className="p-6 sm:p-8">
              {success ? (
                <div className="border-2 border-green-600 bg-green-50 p-3 text-sm font-semibold text-green-700 shadow-[2px_2px_0_0_green]">
                  {t('revoke.success')}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-lg text-(--color-text-)">
                    {t('revoke.description')}
                  </p>

                  {error && (
                    <div className="border-2 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-700 shadow-[2px_2px_0_0_red]">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <FullButton
                      onClick={handleRevoke}
                      disabled={loading}
                      backgroundColor="var(--color-error-light)"
                      className="flex-1 justify-between h-16 text-[15px] sm:text-xl flex-row!"
                    >
                      {loading
                        ? t('revoke.revoking').toUpperCase()
                        : t('revoke.confirm').toUpperCase()}

                      <ArrowRightIcon
                        className={`h-7 transition-transform ${
                          isArabic ? 'rotate-180' : ''
                        }`}
                      />
                    </FullButton>

                    <FullButton
                      onClick={() => router.push('/login')}
                      backgroundColor="var(--color-grey)"
                      className="justify-center h-16 text-[15px] sm:text-xl"
                    >
                      {t('revoke.cancel').toUpperCase()}
                    </FullButton>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}