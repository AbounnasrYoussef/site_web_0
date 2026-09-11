'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import Input from '@/components/input';
import FullButton from '@/components/full-button';
import ArrowRightIcon from '@/public/icons/auth/ArrowRight';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export default function ResetPasswordForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setGeneralError(t('resetPassword.errors.missingToken'));
    }
  }, [token, t]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            token: data.token,
            password: data.password
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || json.errors || json.message || t('resetPassword.errors.generic'));
      }

      return json.message;
    },
    onSuccess: (message) => {
      setSuccessMessage(message || t('resetPassword.success'));
      setGeneralError(null);
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 3000);
    },
    onError: (error: Error) => {
      setGeneralError(error.message);
      setSuccessMessage(null);
    },
    retry: false,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFieldErrors({});
    setGeneralError(null);
    setSuccessMessage(null);

    if (!token) {
      setGeneralError(t('resetPassword.errors.missingToken'));
      return;
    }

    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();
    let hasError = false;

    if (!trimmedPassword) {
      setFieldErrors((prev) => ({ ...prev, password: t('validation.passwordRequired') }));
      hasError = true;
    } else if (!PASSWORD_REGEX.test(trimmedPassword)) {
      setFieldErrors((prev) => ({ ...prev, password: t('validation.passwordInvalid') }));
      hasError = true;
    }

    if (!trimmedConfirm) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: t('validation.confirmPasswordRequired') }));
      hasError = true;
    } else if (trimmedPassword !== trimmedConfirm) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: t('validation.passwordsDoNotMatch'),
      }));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    mutate({ token, password: trimmedPassword });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setFieldErrors((prev) => ({ ...prev, password: undefined }));
    setGeneralError(null);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    setGeneralError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 sm:px-8">
      <Input
        type="password"
        dir="ltr"
        label={t('resetPassword.passwordLabel')}
        placeholder={t('resetPassword.passwordPlaceholder')}
        helper={t('resetPassword.passwordHelper')}
        value={password}
        onChange={handlePasswordChange}
        error={fieldErrors.password}
        disabled={isPending || !token}
      />

      <Input
        type="password"
        dir="ltr"
        label={t('resetPassword.confirmPasswordLabel')}
        placeholder={t('resetPassword.confirmPasswordPlaceholder')}
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        error={fieldErrors.confirmPassword}
        disabled={isPending || !token}
      />

      {generalError && (
        <div className="border-2 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-700 shadow-[2px_2px_0_0_red]">
          {generalError}
        </div>
      )}

      {successMessage && (
        <div className="border-2 border-green-600 bg-green-50 p-3 text-sm font-semibold text-green-700 shadow-[2px_2px_0_0_green]">
          {successMessage}
        </div>
      )}

      <FullButton
        type="submit"
        disabled={isPending || !token}
        backgroundColor="var(--color-accent-soft)"
        className="w-full justify-center h-16 text-[15px] sm:text-xl gap-2"
      >
        {isPending
          ? t('resetPassword.submitting').toUpperCase()
          : t('resetPassword.submit').toUpperCase()}
        <ArrowRightIcon className="h-7" />
      </FullButton>
    </form>
  );
}