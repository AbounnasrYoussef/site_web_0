'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import Input from '@/components/input';
import FullButton from '@/components/full-button';
import ArrowRightIcon from '@/public/icons/auth/ArrowRight';

interface DeleteAccountModalProps {
  isGoogleUser: boolean;
  onConfirm: (value: string) => Promise<void>;
  onClose: () => void;
  t: any;
}

export default function DeleteAccountModal({ isGoogleUser, onConfirm, onClose, t }: DeleteAccountModalProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Portal mount guard (SSR-safe)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const submit = async () => {
    if (!value.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm(value);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-999 bg-black/60 p-4 overflow-y-auto"
      onClick={() => !loading && onClose()}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          className="w-full sm:max-w-[70%] lg:max-w-[50%] bg-(--color-surface) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-(--color-error-light) border-b-[3px] border-b-black p-6 sm:p-8">
            <h1
              id="delete-account-title"
              className="uppercase font-black leading-none tracking-tight text-4xl sm:text-6xl lg:text-7xl"
            >
              {t('profile.deleteAccount.title')}
            </h1>
            <p className="mt-6 uppercase text-xs tracking-[0.25em] font-mono">
              {t('profile.deleteAccount.kicker')}
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 flex flex-col gap-4">
            <p className="text-lg text-(--color-text)">
              {t('profile.deleteAccount.warning')}
            </p>

            <Input
              autoFocus
              label={
                isGoogleUser
                  ? t('profile.deleteAccount.emailLabel')
                  : t('profile.deleteAccount.passwordLabel')
              }
              type={isGoogleUser ? 'email' : 'password'}
              autoComplete={isGoogleUser ? 'off' : 'current-password'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              disabled={loading}
            />

            {error && (
              <div className="border-2 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-700 shadow-[2px_2px_0_0_red]">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-3">
              <FullButton
                onClick={submit}
                disabled={loading || !value.trim()}
                backgroundColor="var(--color-error-light)"
                className="md:flex-1 justify-between h-16 text-[15px] sm:text-xl flex-row!"
              >
                {(loading
                  ? t('profile.deleteAccount.deleting')
                  : t('profile.deleteAccount.confirm')
                ).toUpperCase()}
                <ArrowRightIcon
                  className={`h-7 transition-transform ${isArabic ? 'rotate-180' : ''}`}
                />
              </FullButton>

              <FullButton
                onClick={onClose}
                disabled={loading}
                backgroundColor="var(--color-grey)"
                className="justify-center h-16 text-[15px] sm:text-xl"
              >
                {t('profile.cancel').toUpperCase()}
              </FullButton>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}