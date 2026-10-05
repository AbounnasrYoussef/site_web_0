import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/profile',
          '/dashboard',
          '/admin',
          '/api/',
          '/reset-password',
          '/verify-2fa',
          '/force-change-password',
        ],
      },
    ],
    sitemap: 'https://kharita.ma/sitemap.xml',
  };
}