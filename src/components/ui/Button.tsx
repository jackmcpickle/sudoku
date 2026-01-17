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
}: ButtonProps) {
    const base =
        'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary:
            'bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500',
        ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 focus:ring-slate-500',
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
