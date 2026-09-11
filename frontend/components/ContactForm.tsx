'use client';

import { useState } from 'react';

type Props = {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  sendLabel: string;
};

export default function ContactForm({
  nameLabel,
  namePlaceholder,
  emailLabel,
  emailPlaceholder,
  messageLabel,
  messagePlaceholder,
  sendLabel,
}: Props) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('http://localhost:8000/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });

        // Après 3 secondes, on remet tout à zéro (retour à l'état initial)
        setTimeout(() => {
          setStatus('idle');
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-4 border-(--color-text) p-8 shadow-[6px_6px_0_0_var(--color-text)]"
    >
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide mb-2">
          {nameLabel}
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={namePlaceholder}
          className="w-full border-2 border-(--color-text) p-3 mb-6"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide mb-2">
          {emailLabel}
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder={emailPlaceholder}
          className="w-full border-2 border-(--color-text) p-3 mb-6"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide mb-2">
          {messageLabel}
        </label>
        <textarea
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder={messagePlaceholder}
          rows={5}
          className="w-full border-2 border-(--color-text) p-3 mb-2"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-(--color-accent-soft) border-2 border-(--color-text) py-4 font-bold uppercase shadow-[4px_4px_0_0_var(--color-text)] transition-all duration-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--color-text)] flex items-center justify-center gap-2"
      >
        {status === 'sending' ? 'Sending...' : `${sendLabel} →`}
      </button>

      {status === 'sending' && (
        <p className="mt-4 text-(--color-muted) font-bold">
          Your message is sending...
        </p>
      )}

      {status === 'success' && (
        <p className="mt-4 text-green-600 font-bold">
          ✓ Message sent successfully!
        </p>
      )}

      {status === 'error' && (
        <p className="mt-4 text-red-600 font-bold">
          ✗ Something went wrong. Try again.
        </p>
      )}
    </form>
  );
}