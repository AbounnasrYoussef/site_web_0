'use client';

import { forwardRef, useState, useId, useRef, useEffect, InputHTMLAttributes, ReactNode, ChangeEvent } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode; 
  forgotPasswordHref?: string;
  helper?: ReactNode;
  error?: string | null;
  containerClassName?: string;
  inputDir?: 'ltr' | 'rtl' | undefined;
  multiline?: boolean;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({
  label,
  icon,
  helper,
  error: externalError,
  type,
  className,
  containerClassName,
  inputDir,
  forgotPasswordHref,
  multiline,
  value,
  onChange,
  onBlur,
  required,
  ...props
}, ref) => {
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isPassword = type === 'password';
  const isEmail = type === 'email';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const dir = inputDir || (type === 'email' || type === 'password' ? 'ltr' : undefined);

  const inputId = useId();

  const error = externalError || internalError;

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (multiline) {
      resizeTextarea();
    }
  }, [value, multiline]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value as string;

    if (isEmail && val && !EMAIL_REGEX.test(val)) {
      setInternalError(t('validation.emailInvalid'));
    } else {
      setInternalError(null);
    }

    if (onBlur) {
      onBlur(e as React.FocusEvent<HTMLInputElement>);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (internalError) {
      setInternalError(null);
    }

    if (onChange) {
      onChange(e as ChangeEvent<HTMLInputElement>);
    }
  };

  const sharedClassName = `
    w-full border-2 p-3 text-sm font-semibold 
    shadow-none 
    transition-all duration-100 
    focus:outline-none 
    bg-(--color-surface) text-(--color-text)
    ${isPassword ? 'pr-10' : ''}
    ${
      error
        ? 'border-red-600 bg-red-50 focus:shadow-[2px_2px_0_0_red-600]'
        : 'border-(--color-text) focus:shadow-[2px_2px_0_0_var(--color-text)]'
    }
    ${className ?? ''}
  `;

  const message = error || helper;

  return (
    <div className={`flex flex-col gap-1 ${containerClassName ?? ''}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={inputId} className="text-sm font-bold uppercase tracking-wide text-(--color-text) flex items-center gap-2">
            {icon && icon}
            {label}
          </label>
        )}
        {forgotPasswordHref && (
          <Link
            href={forgotPasswordHref}
            className="text-xs font-medium text-(--color-primary) hover:underline transition-all"
          >
            {t('forgotPassword.title1')}
          </Link>
        )}
      </div>

      <div className="relative">
        {multiline ? (
          <textarea
            ref={(el) => {
              textareaRef.current = el;
              if (typeof ref === 'function') {
                ref(el);
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
              }
            }}
            id={inputId}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={1}
            onInput={resizeTextarea}
            className={`resize-none overflow-hidden ${sharedClassName}`}
            dir={dir}
            required={required}
            {...(props as InputHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={inputType}
            value={value}
            id={inputId}
            onChange={handleChange}
            onBlur={handleBlur}
            className={sharedClassName}
            dir={dir}
            required={required}
            {...props}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-(--color-muted) hover:text-(--color-text) transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        )}
      </div>

      {message && (
        <span className={`text-xs ${error ? 'text-red-700 font-semibold' : 'text-(--color-muted)'}`}>
          {message}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;