'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/app/(zguellou)/providers/AuthProvider'; 
import Input from '@/components/input';
import FullButton from '@/components/full-button';
import ArrowRightIcon from '@/public/icons/auth/ArrowRight';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginForm() {
  const { setAuth } = useAuth();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setGeneralError(decodeURIComponent(error));
    }
  }, [searchParams]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw json;
      }

      return json;
    },

    onSuccess: (data) => {

      // check if password change is required first
      if (data.requires_password_change) {
        sessionStorage.setItem('force_change_token', data.pending_token);
        router.push(`/force-change-password?token=${data.pending_token}`);
        return;
      }

      if (data.needs_2fa) {
        const encodedEmail = encodeURIComponent(data.user.email);
        sessionStorage.setItem('pending_2fa_token', data.pending_token);
        sessionStorage.setItem('otp_expires_at', data.otp_expires_at);
        router.push(
          `/verify-2fa?token=${data.pending_token}&email=${encodedEmail}&expires_at=${data.otp_expires_at}`
        );
        return; 
      }

      setAuth(data.accessToken, data.user);
      router.push('/profile?login=success');
    },

    onError: (error: any) => {
      setFieldErrors({});
      setGeneralError(null);

      if (error?.errors && Array.isArray(error.errors)) {
        const errorsMap: { [key: string]: string } = {};

        error.errors.forEach((err: { field: string; message: string }) => {
          errorsMap[err.field] = err.message;
        });
        setFieldErrors(errorsMap);
      } else if (error?.error) {
        setGeneralError(error.error);
      } else if (error?.message) {
        setGeneralError(error.message);
      } else {
        setGeneralError(t('login.errors.invalidCredentials'));
      }
    },

    retry: false,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFieldErrors({});
    setGeneralError(null);

    const trimmedEmail = email.trim();
    let hasError = false;

    if (!trimmedEmail) {
      setFieldErrors((prev) => ({
        ...prev,
        email: t('validation.emailRequired'),
      }));
      hasError = true;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: t('validation.emailInvalid'),
      }));
      hasError = true;
    }

    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        password: t('validation.passwordRequired'),
      }));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    mutate({ email: trimmedEmail, password: trimmedPassword });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);

    setFieldErrors((prev) => ({
      ...prev,
      email: undefined,
    }));

    setGeneralError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);

    setFieldErrors((prev) => ({
      ...prev,
      password: undefined,
    }));

    setGeneralError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('login.email.label')}
        placeholder={t('login.email.placeholder')}
        dir="ltr"
        value={email}
        onChange={handleEmailChange}
        error={fieldErrors.email}
        disabled={isPending}
        tabIndex={2}
      />

      <Input
        label={t('login.password.label')}
        dir="ltr"
        type="password"
        placeholder={t('login.password.placeholder')}
        forgotPasswordHref="/forgot-password"
        value={password}
        onChange={handlePasswordChange}
        error={fieldErrors.password}
        disabled={isPending}
        tabIndex={3}
      />

      {generalError && (
        <div className="border-2 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-700 shadow-[2px_2px_0_0_red]">
          {generalError}
        </div>
      )}

      <FullButton
        type="submit"
        disabled={isPending}
        backgroundColor="var(--color-accent-soft)"
        className="w-full justify-between h-16 text-[15px] sm:text-xl flex-row!"
        tabIndex={5}
      >
        {isPending ? t('login.submitting').toUpperCase() : t('login.submit').toUpperCase()}

        <ArrowRightIcon
          className={`h-7 transition-transform ${
            isArabic ? 'rotate-180' : ''
          }`}
        />
      </FullButton>
    </form>
  );
}