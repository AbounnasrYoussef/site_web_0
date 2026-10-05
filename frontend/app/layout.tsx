import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLocale, getMessages } from 'next-intl/server';
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import Providers from "./(zguellou)/providers";
import Navbar from "@/components/navbar";
import { Toaster } from "sonner"
import { brandDir } from "@/components/logo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const baseUrl = 'https://kharita.ma';
  const brand = `/brand/${brandDir(locale)}`;
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: baseUrl,
      languages: {
        en: `${baseUrl}?locale=en`,
        fr: `${baseUrl}?locale=fr`,
        ar: `${baseUrl}?locale=ar`,
        'x-default': baseUrl,
      },
    },
    keywords: t('keywords')?.split(',') || [],
    icons: {
      icon: [
        { url: `${brand}/favicon.ico`, sizes: '16x16 32x32 48x48' },
        { url: `${brand}/icon-32.png`, type: 'image/png', sizes: '32x32' },
        { url: `${brand}/icon-192.png`, type: 'image/png', sizes: '192x192' },
        { url: `${brand}/icon-512.png`, type: 'image/png', sizes: '512x512' },
      ],
      apple: { url: `${brand}/apple-icon.png`, sizes: '180x180' },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: baseUrl,
      siteName: 'Kharita',
      locale,
      images: [{ url: `${brand}/icon-512.png`, width: 512, height: 512 }],
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
          <Toaster
            position={dir === "rtl" ? "top-left" : "top-right"}
            dir={dir}
            toastOptions={{
              unstyled: true,
              classNames: {
                toast: "flex items-center gap-2 p-4",
                error:
                  "border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-none font-bold bg-[#82191B] text-white",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}