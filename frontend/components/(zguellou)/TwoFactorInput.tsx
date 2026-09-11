'use client';

import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface TwoFactorInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
  disabled?: boolean;
  length?: number;
  className?: string;
}

export default function TwoFactorInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  length = 6,
  className = '',
}: TwoFactorInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  useEffect(() => {
    const firstEmptyIndex = digits.findIndex((d) => d === ' ');
    const focusIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
    if (focusIndex >= 0 && focusIndex < length) {
      inputsRef.current[focusIndex]?.focus();
    }
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    newDigits[index] = val.slice(-1) || ' ';
    const newValue = newDigits.join('').trim();

    onChange(newValue);

    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newValue.length === length) {
      onComplete?.();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text');
    const pastedDigits = pastedData.replace(/\D/g, '').slice(0, length);

    if (pastedDigits.length > 0) {
      e.preventDefault();
      const newDigits = pastedDigits.padEnd(length, ' ').split('');
      const newValue = newDigits.join('').trim();
      onChange(newValue);

      const lastIndex = Math.min(pastedDigits.length, length) - 1;
      inputsRef.current[lastIndex]?.focus();

      if (newValue.length === length) {
        onComplete?.();
      }
    }
  };

  return (
    <div dir="ltr" className={`flex gap-2 justify-center ${className}`}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digits[index]?.trim() || ''}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold
            border-2 border-(--color-text) bg-(--color-surface)
            transition-all duration-100
            focus:outline-none focus:shadow-[2px_2px_0_0_var(--color-text)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${digits[index]?.trim() ? 'bg-(--color-accent-soft)' : ''}
          `}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  );
}