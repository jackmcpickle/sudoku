import { create } from 'zustand';
import { registerSW } from 'virtual:pwa-register';
import { saveUpdateCheckpoint } from './updateCheckpoint';
import { useGameStore } from '@/stores/gameStore';

export const useAppUpdates = create(() => ({
    available: false,
    checking: false,
    message: '',
}));

let registration: ServiceWorkerRegistration | undefined;

export async function checkForUpdates(): Promise<void> {
    if (useAppUpdates.getState().checking) return;
    if (!registration) {
        useAppUpdates.setState({
            message: 'Updates are not ready yet. Try again shortly.',
        });
        return;
    }
    useAppUpdates.setState({ checking: true, message: '' });
    try {
        await registration.update();
        if (!registration.installing && !useAppUpdates.getState().available) {
            useAppUpdates.setState({ message: 'You’re up to date.' });
        }
    } catch {
        useAppUpdates.setState({
            message: 'Could not check for updates. Reconnect and try again.',
        });
    } finally {
        useAppUpdates.setState({ checking: false });
    }
}

export function applyUpdate(): void {
    if (!useAppUpdates.getState().available) return;
    try {
        if (location.pathname === '/play' && !useGameStore.getState().puzzle) {
            throw new Error('Wait for your puzzle to load before updating.');
        }
        saveUpdateCheckpoint();
        useAppUpdates.setState({ available: false, message: '' });
        window.location.reload();
    } catch (error) {
        useAppUpdates.setState({
            message:
                error instanceof Error && error.message.includes('puzzle')
                    ? error.message
                    : 'Could not save your game on this device. The app has not reloaded. Free some storage and try again.',
        });
    }
}

export function startAppUpdates(): void {
    registerSW({
        immediate: true,
        onNeedReload() {
            useAppUpdates.setState({ available: true, message: '' });
        },
        onRegisteredSW(_url, value) {
            registration = value;
            void checkForUpdates();
        },
        onRegisterError() {
            useAppUpdates.setState({
                message: 'Updates are unavailable. Reopen online to try again.',
            });
        },
    });
    function checkWhenVisible(): void {
        if (document.visibilityState === 'visible' && navigator.onLine)
            void checkForUpdates();
    }
    document.addEventListener('visibilitychange', checkWhenVisible);
    window.addEventListener('focus', checkWhenVisible);
    window.addEventListener('online', checkWhenVisible);
    window.setInterval(checkWhenVisible, 60 * 60 * 1000);
}
