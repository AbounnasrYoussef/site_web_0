import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLocale, getMessages } from 'next-intl/server';
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import Providers from "./(zguellou)/providers";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const baseUrl = 'https://kharita.ma';
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: baseUrl,
      languages: {
        en: `${baseUrl}?locale=en`,
        fr: `${baseUrl}?locale=fr`,
        ar: `${baseUrl}?locale=ar`,
      },
    },
    keywords: t('keywords')?.split(',') || [],
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: baseUrl,
      siteName: 'Kharita',
      locale,
      type: 'website',
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${cairo.variable} h-full antialiased`}>
      <body className={`${locale === 'ar' ? cairo.className : inter.className} min-h-full flex flex-col`}>
        <Providers locale={locale} messages={messages}>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}