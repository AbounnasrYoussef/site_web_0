'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/app/(zguellou)/providers/AuthProvider';
import TwoFactorInput from '@/components/(zguellou)/TwoFactorInput';
import FullButton from '@/components/full-button';

export default function Verify2FAForm() {
  const { setAuth } = useAuth();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState('');
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [requestTimer, setRequestTimer] = useState<number | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const [isResending, setIsResending] = useState(false);

  const getActualCode = (value: string) => value.replace(/\s/g, '');

  useEffect(() => {
    const token = searchParams.get('token');
    const expiresAt = searchParams.get('expires_at');
    const email = searchParams.get('email');

    if (token) {
      setPendingToken(token);
      sessionStorage.setItem('pending_2fa_token', token);
    } else {
      const stored = sessionStorage.getItem('pending_2fa_token');
      if (stored) 
        setPendingToken(stored);
    }

    if (expiresAt) {
      setOtpExpiresAt(expiresAt);
      sessionStorage.setItem('otp_expires_at', expiresAt);
    } else {
      const stored = sessionStorage.getItem('otp_expires_at');
      if (stored) setOtpExpiresAt(stored);
    }

    if (email) {
      setUserEmail(decodeURIComponent(email));
      sessionStorage.setItem('otp_email', email);
    } else {
      const stored = sessionStorage.getItem('otp_email');
      if (stored) setUserEmail(decodeURIComponent(stored));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!pendingToken && !searchParams.get('token')) {
      router.replace('/login');
    }
  }, [pendingToken, router, searchParams]);

  useEffect(() => {
    if (!otpExpiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const expiry = new Date(otpExpiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));

      setTimeRemaining(remaining);
      setIsExpired(remaining === 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  useEffect(() => {
    if (isExpired && pendingToken) {
      setCode('');
    }
  }, [isExpired]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { pending_token: string; code: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/verify-2fa`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 410) {
          throw { type: 'session_expired', message: t('verify2fa.errors.sessionExpired') };
        }

        if (res.status === 401) {
          throw { type: 'invalid_code', message: json.error || t('verify2fa.errors.invalidCode') };
        }

        if (res.status === 429) {
          if (json.reset_after) {
            throw { type: 'rate_limit', reset_after: json.reset_after, message: json.error || t('verify2fa.errors.tooManyRequests') };
          }
          throw { type: 'too_many_attempts', message: json.error || t('verify2fa.errors.tooManyAttempts') };
        }

        throw new Error(json.error || json.message || t('verify2fa.errors.generic'));
      }

      return json;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      sessionStorage.removeItem('pending_2fa_token');
      sessionStorage.removeItem('otp_expires_at');
      sessionStorage.removeItem('otp_email');
      router.push('/profile?verified=true');
    },
    onError: (error: any) => {
      if (error.type === 'session_expired') {
        sessionStorage.removeItem('pending_2fa_token');
        sessionStorage.removeItem('otp_expires_at');
        sessionStorage.removeItem('otp_email');
        router.replace('/login');
        return;
      }

      if (error.type === 'invalid_code') {
        setGeneralError(error.message);
        setCode('');
        return;
      }

      if (error.type === 'too_many_attempts') {
        setGeneralError(error.message);
        setCode('');
        setIsBlocked(true);
        return;
      }

      if (error.type === 'rate_limit' && error.reset_after) {
        setRequestTimer(error.reset_after);
        setGeneralError(error.message || t('verify2fa.errors.tooManyRequests'));
        const interval = setInterval(() => {
          setRequestTimer((prev) => {
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

      setGeneralError(error.message || t('verify2fa.errors.generic'));
      setCode('');
    },
    retry: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!pendingToken) {
      setGeneralError(t('verify2fa.errors.missingToken'));
      return;
    }

    const actualCode = getActualCode(code);
    if (actualCode.length !== 6) {
      setGeneralError(t('verify2fa.errors.invalidCode'));
      return;
    }

    if (isExpired) {
      setGeneralError(t('verify2fa.codeExpired'));
      return;
    }

    if (isBlocked) {
      setGeneralError(t('verify2fa.errors.tooManyAttempts'));
      return;
    }

    mutate({ pending_token: pendingToken, code: actualCode });
  };

  const handleResendCode = async () => {
    if (!pendingToken) return;

    setIsResending(true);
    setGeneralError(null);
    setCode('');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/resend-2fa`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ pending_token: pendingToken }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 410) {
          sessionStorage.removeItem('pending_2fa_token');
          sessionStorage.removeItem('otp_expires_at');
          sessionStorage.removeItem('otp_email');
          router.replace('/login');
          return;
        }

        if (res.status === 429 && json.reset_after) {
          setRequestTimer(json.reset_after);
          setGeneralError(json.error || t('verify2fa.errors.tooManyRequests'));
          const interval = setInterval(() => {
            setRequestTimer((prev) => {
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

        throw new Error(json.error || json.message || t('verify2fa.errors.generic'));
      }

      if (json.pending_token) {
        setPendingToken(json.pending_token);
        sessionStorage.setItem('pending_2fa_token', json.pending_token);
      }
      if (json.otp_expires_at) {
        setOtpExpiresAt(json.otp_expires_at);
        sessionStorage.setItem('otp_expires_at', json.otp_expires_at);
        setIsExpired(false);
        setTimeRemaining(null);
      }

      setIsBlocked(false);
      setGeneralError(null);
    } catch (error: any) {
      if (error.message?.includes('session') || error.message?.includes('invalid')) {
        router.replace('/login');
        return;
      }
      setGeneralError(error.message || t('verify2fa.errors.generic'));
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!pendingToken) {
    return (
      <div className="p-6 text-center">
        <p className="text-(--color-muted)">{t('verify2fa.loading')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-5 sm:px-8">
      <div className="text-center">
        <p className="text-sm text-(--color-muted)">
          {t('verify2fa.instruction')}
        </p>
        {userEmail && (
          <p className="text-xs font-bold uppercase tracking-wide text-(--color-text) mt-1">
            {userEmail}
          </p>
        )}

        {timeRemaining !== null && (
          <p className={`text-xs mt-2 ${isExpired ? 'text-red-600 font-bold' : 'text-(--color-muted)'}`}>
            {isExpired
              ? t('verify2fa.codeExpired')
              : `${t('verify2fa.codeExpiresIn')} ${formatTime(timeRemaining)}`}
          </p>
        )}
      </div>

      <TwoFactorInput
        value={code}
        onChange={setCode}
        onComplete={() => {
          const actualCode = getActualCode(code);
          if (actualCode.length === 6 && !isExpired && !isPending && !isBlocked) {
            handleSubmit(new Event('submit') as any);
          }
        }}
        disabled={isPending || isResending || isExpired || isBlocked}
      />

      {generalError && (
        <div className="border-2 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-700 shadow-[2px_2px_0_0_red]">
          {generalError}
          {requestTimer !== null && (
            <span className="block mt-1 text-xs">
              {t('verify2fa.tryAgainIn')} {formatTime(requestTimer)}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <FullButton
          type="submit"
          disabled={isPending || getActualCode(code).length !== 6 || isExpired || requestTimer !== null || isBlocked}
          backgroundColor="var(--color-accent-soft)"
          className="w-full justify-center h-14 text-lg"
        >
          {isPending ? t('verify2fa.verifying').toUpperCase() : t('verify2fa.verify').toUpperCase()}
        </FullButton>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={isPending || isResending || requestTimer !== null}
          className="cursor-pointer text-sm text-(--color-muted) hover:text-(--color-accent) underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExpired || isBlocked
            ? t('verify2fa.requestNewCode')
            : isResending
            ? t('verify2fa.sending')
            : t('verify2fa.resendCode')}
        </button>
      </div>
    </form>
  );
}