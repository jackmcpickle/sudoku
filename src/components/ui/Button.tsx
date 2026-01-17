import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    active?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    active = false,
    className = '',
    disabled,
    ...props
}: ButtonProps): React.ReactElement {
    const base =
        'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-(--ring-offset) disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary:
            'bg-(--accent) text-white hover:bg-(--accent-hover) focus:ring-(--accent)',
        secondary:
            'bg-(--surface-alt) text-(--body-text) hover:bg-(--surface) focus:ring-(--text-muted)',
        ghost: 'bg-transparent text-(--text-muted) hover:bg-(--surface-alt) focus:ring-(--text-muted)',
    };

    const sizes = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${sizes[size]} ${active ? 'ring-2 ring-blue-500' : ''} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
