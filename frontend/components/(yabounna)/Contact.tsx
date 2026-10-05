'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Input from '../input';

const API_URL = 'http://localhost:5003';

export default function Contact() {
  const t = useTranslations('home.contact');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="contact" className="border-t-4 border-(--color-text)">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start px-6 py-24">
        <div>
          <p className="inline-block border-2 border-(--color-text) bg-(--color-accent-soft) px-4 py-1 mb-6 text-xs font-bold uppercase tracking-wide shadow-[4px_4px_0_0_var(--color-text)]">
            {t('badge')}
          </p>

          <h2 className="text-4xl sm:text-5xl font-black uppercase leading-tight mb-6">
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
          </h2>

          <div className="border-2 border-(--color-text) bg-(--color-accent-soft)/10 p-6 shadow-[4px_4px_0_0_var(--color-text)]">
            <p className="text-base">{t('description')}</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-4 border-(--color-text) bg-(--color-surface) p-8 shadow-[6px_6px_0_0_var(--color-text)]"
        >
          <Input
            label={t('nameLabel')}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('namePlaceholder')}
            containerClassName="mb-6"
          />

          <Input
            label={t('emailLabel')}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            containerClassName="mb-6"
          />

          <div className="flex flex-col gap-1 mb-6">
            <label htmlFor="contact-message" className="text-sm font-bold uppercase tracking-wide">
              {t('messageLabel')}
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('messagePlaceholder')}
              className="w-full border-2 border-(--color-text) bg-(--color-surface) p-3 text-sm font-semibold transition-all duration-100 focus:outline-none focus:shadow-[2px_2px_0_0_var(--color-text)]"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full border-2 border-(--color-text) bg-(--color-accent-soft) py-4 font-bold uppercase shadow-[4px_4px_0_0_var(--color-text)] transition-all duration-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? t('sending') : `${t('send')} →`}
          </button>

          <div role="status" aria-live="polite">
            {status === 'success' && (
              <p className="mt-4 font-bold text-green-600">{t('success')}</p>
            )}
            {status === 'error' && (
              <p className="mt-4 font-bold text-red-600">{t('error')}</p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}