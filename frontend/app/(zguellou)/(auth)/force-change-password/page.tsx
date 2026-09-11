'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Input from '@/components/input';
import FullButton from '@/components/full-button';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export default function ForceChangePasswordPage() {
  const t = useTranslations('resetPassword');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Safely read sessionStorage after mount
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const storedToken = typeof window !== 'undefined'
      ? sessionStorage.getItem('force_change_token')
      : null;
    setToken(urlToken || storedToken);
  }, [searchParams]);

  useEffect(() => {
    if (!token) {
      setError(t('errors.missingToken'));
    }
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(t('errors.missingToken'));
      return;
    }

    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedPassword) {
      setError(t('validation.passwordRequired'));
      return;
    }
    if (!PASSWORD_REGEX.test(trimmedPassword)) {
      setError(t('validation.passwordInvalid'));
      return;
    }
    if (trimmedPassword !== trimmedConfirm) {
      setError(t('validation.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/change-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ pending_token: token, new_password: trimmedPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || t('errors.generic'));
      }

      setSuccess(true);
      sessionStorage.removeItem('force_change_token');
      setTimeout(() => router.push('/login?passwordChanged=true'), 3000);
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
          <h1 className="text-2xl font-black mb-4">{t('title')}</h1>
          <p className="text-red-600">{t('errors.missingToken')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen dotted-bg">
      <div className="w-full max-w-md p-6 border-2 border-(--color-text) bg-(--color-surface) shadow-[4px_4px_0_0_var(--color-text)]">
        <h1 className="text-2xl font-black uppercase mb-4">{t('title')}</h1>
        <p className="text-sm text-(--color-muted) mb-6">{t('description')}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="password"
            dir="ltr"
            label={t('passwordLabel')}
            placeholder={t('passwordPlaceholder')}
            helper={t('passwordHelper')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || success}
          />

          <Input
            type="password"
            dir="ltr"
            label={t('confirmPasswordLabel')}
            placeholder={t('confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || success}
          />

          {error && (
            <div className="border-2 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-700 shadow-[2px_2px_0_0_red]">
              {error}
            </div>
          )}

          {success && (
            <div className="border-2 border-green-600 bg-green-50 p-3 text-sm font-semibold text-green-700 shadow-[2px_2px_0_0_green]">
              {t('success')}
            </div>
          )}

          <FullButton
            type="submit"
            disabled={loading || success || !token}
            backgroundColor="var(--color-accent-soft)"
            className="w-full justify-center h-12"
          >
            {loading ? t('submitting') : t('submit')}
          </FullButton>
        </form>
      </div>
    </div>
  );
}