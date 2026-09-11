'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Input from '@/components/input';
import FullButton from '@/components/full-button';
import RecycleIcon from '@/public/icons/auth/RecycleIcon';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ForgotPasswordForm() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [rateLimitTimer, setRateLimitTimer] = useState<number | null>(null);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const { mutate, isPending, data, reset } = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email }),
        }
      );

      await sleep(1000);

      const json = await res.json();

      if (res.status === 429) {
        const resetSeconds = parseInt(res.headers.get('RateLimit-Reset') || '0');
        throw { type: 'rate_limit', reset_after: resetSeconds, message: json.error || t('forgotPassword.error') };
      }

      if (!res.ok) {
        const errorMessage = json.error || json.message || t('forgotPassword.error');
        throw new Error(errorMessage);
      }

      return json.message;
    },
    onError: (error: any) => {
      if (error.type === 'rate_limit' && error.reset_after) {
        setRateLimitTimer(error.reset_after);
        setGeneralError(error.message || t('verify2fa.errors.tooManyRequests'));

        const interval = setInterval(() => {
          setRateLimitTimer((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(interval);
              setGeneralError(null);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        return;
      }

      setGeneralError(error.message || t('forgotPassword.error'));
    },
    onSuccess: () => {
      setGeneralError(null);
      setRateLimitTimer(null);
    },
    retry: false,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    reset();
    setFieldError(null);
    setGeneralError(null);
    setRateLimitTimer(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setFieldError(t('validation.emailRequired'));
      return;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setFieldError(t('validation.emailInvalid'));
      return;
    }

    mutate(trimmedEmail);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setFieldError(null);
    setGeneralError(null);
    setRateLimitTimer(null);
    reset();
  };

  const successMessage = data ?? null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 sm:px-8">
      <Input
        label={t('forgotPassword.emailLabel')}
        placeholder={t('forgotPassword.emailPlaceholder')}
        dir="ltr"
        value={email}
        onChange={handleEmailChange}
        error={fieldError}
        disabled={isPending || rateLimitTimer !== null}
      />

      {generalError && (
        <div className="border-2 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-700 shadow-[2px_2px_0_0_red]">
          {generalError}
          {rateLimitTimer !== null && (
            <div className="mt-2 flex items-center gap-2">
              <span>
                {t('verify2fa.tryAgainIn')}{' '}
                <span className="font-bold">
                  {formatTime(rateLimitTimer)}
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {successMessage && (
        <div className="border-2 border-green-600 bg-green-50 p-3 text-sm font-semibold text-green-700 shadow-[2px_2px_0_0_green]">
          {successMessage || t('forgotPassword.success')}
        </div>
      )}

      <FullButton
        type="submit"
        disabled={isPending || rateLimitTimer !== null}
        backgroundColor="var(--color-accent-soft)"
        className="w-full justify-center h-16 text-[15px] sm:text-xl gap-2"
      >
        {isPending
          ? t('forgotPassword.sending').toUpperCase()
          : t('forgotPassword.sendResetLink').toUpperCase()}
        <RecycleIcon
          className={`w-6 h-6 text-(--color-text) transition-all duration-300 ${
            isPending ? 'animate-spin' : ''
          }`}
        />
      </FullButton>
    </form>
  );
}