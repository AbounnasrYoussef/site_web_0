import Link from 'next/link';


const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
];

export default function SimpleNavbar () {
  return (
    <header className={`border-2 border-x-0 border-t-0 border-(--color-text) bg-(--color-surface) shadow-[4px_4px_0_0_var(--color-text)] flex justify-center`}>
          <Link
            href="/"
            className="mx-auto px-5 py-3 sm:px-8 text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            KHARITA
          </Link>
    </header>
  );
}