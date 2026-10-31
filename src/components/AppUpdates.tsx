import type { ReactElement } from 'react';
import { useAppUpdates, checkForUpdates, applyUpdate } from '@/lib/appUpdates';
import { Button } from '@/components/ui';

export function AppUpdates(): ReactElement {
    const { available, checking, message } = useAppUpdates();
    return (
        <footer className="max-w-lg mx-auto px-4 pb-6 text-center text-sm text-(--text-muted)">
            {available && (
                <output className="block mb-3 rounded-lg bg-(--surface) p-4 text-(--body-text)">
                    <span className="block font-medium mb-1">
                        Update available
                    </span>
                    <span className="block text-sm text-(--text-muted) mb-3">
                        Your game will be saved on this device before reloading.
                    </span>
                    <Button
                        size="sm"
                        onClick={applyUpdate}
                    >
                        Update now
                    </Button>
                </output>
            )}
            <p className="text-xs mb-2">Version {__APP_VERSION__}</p>
            <Button
                size="sm"
                variant="ghost"
                disabled={checking}
                onClick={checkForUpdates}
            >
                {checking ? 'Checking…' : 'Check for updates'}
            </Button>
            {message && <output className="block mt-2">{message}</output>}
        </footer>
    );
}
