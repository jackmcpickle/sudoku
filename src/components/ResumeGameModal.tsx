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
}: ResumeGameModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {}}
            title="Continue Game?"
        >
            <div className="space-y-4">
                <p className="text-slate-300">
                    You have an unfinished{' '}
                    <span className="capitalize font-medium text-white">
                        {difficulty}
                    </span>{' '}
                    game.
                </p>
                <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-sm text-slate-400">Time played</div>
                    <div className="text-xl font-mono text-white">
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
