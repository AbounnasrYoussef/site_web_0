import Link from 'next/link'
import type { ButtonHTMLAttributes, CSSProperties, MouseEventHandler, ReactNode } from 'react'

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  children: ReactNode
    backgroundColor: string
    hoverBackgroundColor?: string
  href?: string
    active?: boolean
    animated?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
}

export default function IconButton({
    children,
    className = '',
    type = 'button',
    href,
    backgroundColor,
    hoverBackgroundColor,
    active = false,
    animated = true,
    ...props
}: IconButtonProps) {
    const sharedStyle = {
    backgroundColor,
    '--hover-bg': hoverBackgroundColor ?? backgroundColor,
    } as CSSProperties

    const sharedClassName = active
        ? animated
            ? `grid h-10 w-10 cursor-pointer place-items-center border-2 border-(--color-text) font-bold shadow-none translate-x-0.5 translate-y-0.5 transition-colors hover:bg-[var(--hover-bg)] ${className}`
            : `grid h-10 w-10 cursor-pointer place-items-center border-2 border-(--color-text) font-bold shadow-none transition-colors hover:bg-[var(--hover-bg)] ${className}`
        : animated
            ? `grid h-10 w-10 cursor-pointer place-items-center border-2 border-(--color-text) shadow-[2px_2px_0_0_var(--color-text)] transition-all duration-100 hover:bg-[var(--hover-bg)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-text)] active:translate-x-1 active:translate-y-1 active:shadow-none ${className}`
            : `grid h-10 w-10 cursor-pointer place-items-center border-2 border-(--color-text) shadow-[2px_2px_0_0_var(--color-text)] transition-colors hover:bg-[var(--hover-bg)] ${className}`

    if (href) {
        return (
            <Link href={href} className={sharedClassName} style={sharedStyle} onClick={props.onClick} aria-label={props['aria-label']}>
                {children}
            </Link>
        )
    }

    return (
        <button type={type} className={sharedClassName} style={sharedStyle} {...props}>
            {children}
        </button>
    )
}