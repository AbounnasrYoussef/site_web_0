import RegisterForm from './RegisterForm';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import FullButton from '@/components/full-button';
import GoogleMonoIcon from '@/public/icons/auth/GoogleMonoIcon';
import GoogleIcon from '@/public/icons/auth/GoogleIcon';

export default function RegisterPage() {
  const t = useTranslations('register');

  return (
    <div className="flex-1 squared-bg flex items-center justify-center p-4">
      <div className="container flex justify-center">
        <div className="w-full sm:max-w-[70%] lg:max-w-[50%] bg-(--color-surface) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)]">

                <div className="bg-(--color-highlight) border-b-[3px] border-b-black p-6 sm:p-8">
                  <h1 className="uppercase font-black leading-none tracking-tight text-4xl sm:text-6xl lg:text-7xl">
                    {t('title')}
                  </h1>

                  <p className="mt-6 uppercase text-xs tracking-[0.25em] font-mono">
                    {t('subtitle')}
                  </p>
                </div>

                <div className="p-6 pb-4 sm:p-8 sm:pb-4 border-b-[3px] border-b-black">
                  <FullButton
                    text={t('continueWithGoogle')}
                    className="w-full justify-center h-12"
                    classNameText='text-md'
                    href={`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/google`}
                  >
                    <GoogleMonoIcon className="w-5 h-5 text-black" />
                    {/* <GoogleIcon className="w-5 h-5" /> */}
                  </FullButton>

                  <div className="relative p-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-(--color-text)"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-(--color-surface) px-3 font-bold text-(--color-text)">{t('orEnterManually')}</span>
                    </div>
                  </div>
                  <RegisterForm />
                </div>


                <div className="text-center text-sm p-4 bg-(--color-grey)">
                  <span className="text-(--color-muted)">{t('login.text')} </span>
                  <Link
                    href="/login"
                    className="font-bold text-(--color-text) underline decoration-2 underline-offset-4 hover:text-(--color-accent)"
                    >
                    {t('login.link')}
                  </Link>
                </div>
              </div>
          </div>
        </div>
  );
}