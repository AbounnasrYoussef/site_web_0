import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import ForgotPasswordForm from './ForgotPasswordForm';
import KeyIcon from '@/public/icons/auth/KeyIcon';

export default async function ForgotPasswordPage() {
  const t = await getTranslations('forgotPassword'); 

  return (
    <div className="flex-1 dotted-bg flex items-center justify-center p-4">
      <div className="container flex justify-center">
        <div className="w-full sm:max-w-[70%] lg:max-w-[50%] border-2 border-(--color-text) bg-(--color-surface) shadow-[4px_4px_0_0_var(--color-text)]">

          <div className="bg-(--color-accent-soft) border-b-[3px] border-b-black p-4 pt-6 sm:p-8">
            <h1 className="flex justify-between items-center uppercase font-black leading-none tracking-tight text-2xl sm:text-4xl lg:text-6xl">
              {t('title')}
              <KeyIcon className="h-[1em] w-[1em] text-(--color-text)" />
            </h1>

            <p className="mt-6 uppercase text-xs tracking-[0.25em] font-mono">
              {t('description')}
            </p>
          </div>

          <ForgotPasswordForm />

          <div className="text-center text-sm p-4 bg-(--color-grey) border-t-[3px] border-t-black">
            <span className="text-(--color-muted)">{t('rememberPassword')} </span>
            <Link
              href="/login"
              className="font-bold text-(--color-text) underline decoration-2 underline-offset-4 hover:text-(--color-accent)"
              >
              {t('backToLogin')}
            </Link>
          </div>


        </div>
      </div>
    </div>
  );
}