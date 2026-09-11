'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

type Message = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

type ContactDashboardProps = {
  apiUrl?: string;
};

export default function ContactDashboard({ apiUrl = 'http://localhost:8000/contact' }: ContactDashboardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const t = useTranslations("dashboard")

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        setMessages(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [apiUrl]);

  return (
    <div className="text-(--color-text)">
      <h1 className="text-4xl sm:text-5xl font-black uppercase mb-10">
        {t('contact.title')}
      </h1>

      {loading && <p>{t('contact.loading')}</p>}
      {error && <p className="text-red-600 font-bold">{t('contact.error')}</p>}

      {!loading && !error && messages.length === 0 && (
        <p className="text-(--color-muted)">{t('contact.no_message')}</p>
      )}

      {!loading && !error && messages.length > 0 && (
        <div className="border-4 border-(--color-text) shadow-[6px_6px_0_0_var(--color-text)] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-(--color-text) text-(--color-bg) text-left rtl:text-right">
                <th className="p-4 uppercase text-xs font-bold">{t('contact.name')}</th>
                <th className="p-4 uppercase text-xs font-bold">{t('contact.email')}</th>
                <th className="p-4 uppercase text-xs font-bold">{t('contact.message')}</th>
                <th className="p-4 uppercase text-xs font-bold">{t('contact.date')}</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} className="border-t-2 border-(--color-text)">
                  <td className="p-4 font-bold">{msg.name}</td>
                  <td className="p-4">{msg.email}</td>
                  <td className="p-4 text-(--color-muted)">{msg.message}</td>
                  <td className="p-4 text-sm">
                    {new Date(msg.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}