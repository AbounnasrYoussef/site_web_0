'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from './providers/AuthProvider';

interface ProvidersProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}

export default function Providers({ children, locale, messages }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Africa/Casablanca">
          {children}
          {/* <ReactQueryDevtools initialIsOpen={false} /> for debugging */}
        </NextIntlClientProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
