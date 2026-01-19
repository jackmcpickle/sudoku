import { Modal, Button } from '@/components/ui';
import { formatTime } from '@/lib/scoring';
import type { Difficulty } from '@/types';

interface ResumeGameModalProps {
    isOpen: boolean;
    difficulty: Difficulty;
    timer: number;
    onResume: () => void;
    onNewGame: () => void;
}

export function ResumeGameModal({
    isOpen,
    difficulty,
    timer,
    onResume,
    onNewGame,
}: ResumeGameModalProps): React.ReactElement {
    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {}}
            title="Continue Game?"
        >
            <div className="space-y-4">
                <p className="text-(--text-muted)">
                    You have an unfinished{' '}
                    <span className="capitalize font-medium text-(--body-text)">
                        {difficulty}
                    </span>{' '}
                    game.
                </p>
                <div className="bg-(--surface-alt) rounded-lg p-3 text-center">
                    <div className="text-sm text-(--text-muted)">
                        Time played
                    </div>
                    <div className="text-xl font-mono text-(--body-text)">
                        {formatTime(timer)}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={onResume}
                        className="flex-1"
                    >
                        Continue
                    </Button>
                    <Button
                        onClick={onNewGame}
                        variant="secondary"
                        className="flex-1"
                    >
                        New Game
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
