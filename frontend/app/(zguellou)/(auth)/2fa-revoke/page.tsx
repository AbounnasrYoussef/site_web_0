'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import FullButton from '@/components/full-button';

export default function TwoFactorRevokePage() {
  const t = useTranslations('verify2fa');
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

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen dotted-bg">
        <div className="max-w-md p-6 border-2 border-(--color-text) bg-(--color-surface)">
          <h1 className="text-2xl font-black mb-4">{t('revoke.title')}</h1>
          <p className="text-red-600">{t('errors.missingToken')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen dotted-bg">
      <div className="max-w-md p-6 border-2 border-(--color-text) bg-(--color-surface) shadow-[4px_4px_0_0_var(--color-text)]">
        <h1 className="text-2xl font-black uppercase mb-4">
          {success ? t('revoke.successTitle') : t('revoke.title')}
        </h1>

        {success ? (
          <p className="text-green-600">{t('revoke.success')}</p>
        ) : (
          <>
            <p className="mb-4 text-(--color-muted)">{t('revoke.description')}</p>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <div className="flex gap-3">
              <FullButton onClick={handleRevoke} disabled={loading} backgroundColor="var(--color-accent-soft)">
                {loading ? t('revoke.revoking') : t('revoke.confirm')}
              </FullButton>
              <FullButton onClick={() => router.push('/login')} backgroundColor="var(--color-grey)">
                {t('revoke.cancel')}
              </FullButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}