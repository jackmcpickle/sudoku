import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps): React.ReactElement | null {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        function handleEscape(e: KeyboardEvent): void {
            if (e.key === 'Escape') onClose();
        }
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            return () => window.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <button
                type="button"
                className="absolute inset-0 bg-black/70 cursor-default"
                onClick={onClose}
                tabIndex={-1}
                aria-label="Close modal"
            />
            <div className="relative z-10 bg-(--surface) rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                {title && (
                    <h2 className="text-xl font-bold mb-4 text-(--body-text)">
                        {title}
                    </h2>
                )}
                {children}
            </div>
        </div>
    );
}
