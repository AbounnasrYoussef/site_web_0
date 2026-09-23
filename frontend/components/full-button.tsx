import Link from 'next/link';
import { ReactNode } from 'react';

interface FullButtonProps {
  children?: ReactNode;
  text?: string;
  backgroundColor?: string;
  href?: string;
  className?: string;
  classNameText?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  tabIndex?: number;
  isActive?: boolean;
}

export default function FullButton({
  children,
  text,
  backgroundColor,
  href,
  className = '',
  classNameText = '',
  onClick,
  type = 'button',
  disabled = false,
  tabIndex,
  isActive = false,  
}: FullButtonProps) {
  const baseStyles = `
    border-2 border-(--color-text) 
    px-3 sm:px-6 py-2 text-xs sm:text-sm font-semibold 
    shadow-[4px_4px_0_0_var(--color-text)] 
    rtl:flex-row-reverse 
    transition-all duration-100
    ${className}
  `;

  const interactiveStyles = disabled || isActive
    ? 'translate-x-1 translate-y-1 shadow-none'
    : `
        hover:translate-x-0.5
        hover:translate-y-0.5
        hover:shadow-[2px_2px_0_0_var(--color-text)]
        active:translate-x-1
        active:translate-y-1
        active:shadow-none
      `;

  const sharedClasses = `inline-flex items-center gap-2 ${interactiveStyles} ${baseStyles} disabled:opacity-50 disabled:cursor-not-allowed`;

  const content = (
    <>
      {children}
      {text && <span className={classNameText}>{text}</span>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        style={{ backgroundColor }}
        aria-disabled={disabled}
        aria-current={isActive ? 'page' : undefined}
        className={`justify-center ${sharedClasses} ${disabled ? 'pointer-events-none' : 'cursor-pointer'}`}
        tabIndex={tabIndex}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      style={{ backgroundColor }}
      className={`cursor-pointer justify-between ${sharedClasses}`}
      disabled={disabled}
      tabIndex={tabIndex}
    >
      {content}
    </button>
  );
}