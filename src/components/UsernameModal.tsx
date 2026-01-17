import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { useUserStore } from '@/stores/userStore';
import { generateFunName } from '@/lib/nameGenerator';
import { getUserByUsername } from '@/lib/api';

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

interface UsernameModalProps {
    isOpen: boolean;
    onClose?: () => void;
}

export function UsernameModal({ isOpen, onClose }: UsernameModalProps): React.ReactElement {
    const [input, setInput] = useState('');
    const [validationError, setValidationError] = useState('');
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [existingVisitorId, setExistingVisitorId] = useState<string | null>(
        null,
    );
    const setUsername = useUserStore((state) => state.setUsername);
    const loginByUsername = useUserStore((state) => state.loginByUsername);
    const isLoading = useUserStore((state) => state.isLoading);
    const error = useUserStore((state) => state.error);
    const clearError = useUserStore((state) => state.clearError);

    function handleGenerateName(): void {
        setInput(generateFunName());
        setValidationError('');
        clearError();
    }

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setValidationError('');
        clearError();

        const trimmed = input.trim();
        if (!USERNAME_REGEX.test(trimmed)) {
            setValidationError(
                '3-20 chars, letters/numbers/underscore/hyphen only',
            );
            return;
        }

        try {
            const existing = await getUserByUsername(trimmed);
            if (
                existing &&
                existing.visitorId !== useUserStore.getState().visitorId
            ) {
                setExistingVisitorId(existing.visitorId);
                setShowResumePrompt(true);
                return;
            }

            await setUsername(trimmed);
            onClose?.();
        } catch {
            // Error handled in store
        }
    }

    async function handleResume(): Promise<void> {
        if (!existingVisitorId) return;
        try {
            await loginByUsername(input.trim(), existingVisitorId);
            setShowResumePrompt(false);
            onClose?.();
        } catch {
            // Error handled in store
        }
    }

    function handleCancel(): void {
        setShowResumePrompt(false);
        setExistingVisitorId(null);
    }

    if (showResumePrompt) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose || (() => {})}
                title="Resume Session?"
            >
                <div className="space-y-4">
                    <p className="text-sm text-(--text-muted)">
                        This username is already in use on another device.
                        Resume that session here?
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleResume}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Resuming...' : 'Resume'}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleCancel}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose || (() => {})}
            title="Choose a Username"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <p className="text-sm text-(--text-muted)">
                    Your username will appear on the leaderboard.
                </p>
                <div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter username"
                            className="flex-1 px-4 py-3 bg-(--surface-alt) border border-(--surface-alt) rounded-lg text-(--body-text) placeholder-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent)"
                            disabled={isLoading}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleGenerateName}
                            disabled={isLoading}
                        >
                            Random
                        </Button>
                    </div>
                    {(validationError || error) && (
                        <p className="mt-2 text-sm text-(--error)">
                            {validationError || error}
                        </p>
                    )}
                </div>
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !input.trim()}
                >
                    {isLoading ? 'Saving...' : 'Save'}
                </Button>
            </form>
        </Modal>
    );
}
