'use client';

import { forwardRef, useState, InputHTMLAttributes, ReactNode, ChangeEvent, useId } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  forgotPasswordHref?: string;
  icon?: ReactNode;
  helper?: ReactNode;
  error?: string | null;
  containerClassName?: string;
  inputDir?: 'ltr' | 'rtl' | undefined;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  icon,
  id: externalId,
  helper,
  error: externalError,
  type,
  className,
  containerClassName,
  inputDir,
  forgotPasswordHref,
  value,
  onChange,
  onBlur,
  required,
  ...props
}, ref) => {
  const t = useTranslations();
  const [showPassword, setShowPassword] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Generate a unique ID for accessibility if no ID is passed in
  const generatedId = useId();
  const inputId = externalId || generatedId;

  const isPassword = type === 'password';
  const isEmail = type === 'email';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const dir = inputDir || (type === 'email' || type === 'password' ? 'ltr' : undefined);
  const linkTabIndex = typeof props.tabIndex === 'number' ? props.tabIndex + 1 : undefined;


  const error = externalError || internalError;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    const val = e.target.value as string;

    if (isEmail && val && !EMAIL_REGEX.test(val)) {
      setInternalError(t('validation.emailInvalid'));
    } else {
      setInternalError(null);
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (internalError) {
      setInternalError(null);
    }

    if (onChange) {
      onChange(e);
    }
  };

  const message = error || helper;

  return (
    <div className={`flex flex-col gap-1 ${containerClassName ?? ''}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-sm font-bold uppercase tracking-wide text-(--color-text) flex gap-2 items-center"
          >
            {icon && icon}
            {label}
          </label>
        )}
        {forgotPasswordHref && (
          <Link
            href={forgotPasswordHref}
            className="text-xs font-medium text-(--color-primary) hover:underline transition-all"
            tabIndex={linkTabIndex}
          >
            {t('forgotPassword.title1')}
          </Link>
        )}
      </div>

      <div className="relative">
        <input
          ref={ref}
          id={inputId} // Associate with the label
          type={inputType}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`
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
          `}
          dir={dir}
          required={required}
          {...props}
        />

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
        <span className={`text-xs break-words whitespace-normal block ${error ? 'text-red-700 font-semibold' : 'text-(--color-muted)'}`}>
          {message}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;