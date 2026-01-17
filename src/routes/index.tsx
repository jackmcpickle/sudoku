import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { DIFFICULTIES } from '@/lib/sudoku/difficulty';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import { UsernameModal } from '@/components/UsernameModal';
import { ResumeGameModal } from '@/components/ResumeGameModal';
import { getSavedGame, deleteGame } from '@/lib/api';
import type { Difficulty } from '@/types';
import type { ApiSavedGame } from '@/lib/api';

export const Route = createFileRoute('/')({
    component: HomePage,
});

function HomePage(): React.ReactElement {
    const navigate = useNavigate();
    const username = useUserStore((state) => state.username);
    const visitorId = useUserStore((state) => state.visitorId);
    const init = useUserStore((state) => state.init);
    const loadGame = useGameStore((state) => state.loadGame);
    const reset = useGameStore((state) => state.reset);

    const [savedGame, setSavedGame] = useState<ApiSavedGame | null>(null);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        void init();
    }, [init]);

    useEffect(() => {
        if (!visitorId) return;

        void getSavedGame(visitorId).then((game) => {
            if (game) {
                setSavedGame(game);
                setShowResumeModal(true);
            }
            setHasChecked(true);
        });
    }, [visitorId]);

    const isChecking = !hasChecked && visitorId;

    async function handleStart(difficulty: Difficulty): Promise<void> {
        if (savedGame) {
            await deleteGame(visitorId);
            setSavedGame(null);
        }
        reset();
        void navigate({ to: '/play', search: { difficulty } });
    }

    function handleResume(): void {
        if (!savedGame) return;
        loadGame({
            puzzle: savedGame.puzzle,
            solution: savedGame.solution,
            difficulty: savedGame.difficulty,
            board: savedGame.board,
            timer: savedGame.timer,
            hintsUsed: savedGame.hintsUsed,
            mistakes: savedGame.mistakes,
            pointsLost: savedGame.pointsLost,
            history: savedGame.history,
        });
        setShowResumeModal(false);
        void navigate({
            to: '/play',
            search: { difficulty: savedGame.difficulty, resume: true },
        });
    }

    const [showUsernameModal, setShowUsernameModal] = useState(false);

    async function handleNewGame(): Promise<void> {
        if (savedGame) {
            await deleteGame(visitorId);
            setSavedGame(null);
        }
        setShowResumeModal(false);
    }

    if (isChecking) {
        return (
            <div className="max-w-md mx-auto px-4 text-center">
                <div className="animate-pulse text-(--text-muted)">Loading...</div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-(--body-text) mb-2">Sudoku</h1>
            {username ? (
                <p className="text-(--text-muted) mb-1">
                    Welcome, <span className="text-(--accent)">{username}</span>
                </p>
            ) : (
                <div className="mb-1 flex items-center justify-center gap-2">
                    <p className="text-(--text-muted)">Playing as guest</p>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowUsernameModal(true)}
                    >
                        Save to Cloud
                    </Button>
                </div>
            )}
            <p className="text-(--text-muted) text-sm mb-8">
                Select a difficulty to start
            </p>
            <div className="space-y-3">
                {DIFFICULTIES.map((difficulty) => (
                    <Button
                        key={difficulty}
                        onClick={() => handleStart(difficulty)}
                        variant="secondary"
                        size="lg"
                        className="w-full capitalize"
                    >
                        {difficulty}
                    </Button>
                ))}
            </div>
            <div className="mt-12 text-sm text-(--text-muted)">
                <p className="mb-2">How to play:</p>
                <ul className="text-left space-y-1 max-w-xs mx-auto">
                    <li>Fill the 9x9 grid with numbers 1-9</li>
                    <li>
                        Each row, column, and 3x3 box must contain all digits
                        1-9
                    </li>
                    <li>Use notes (N key) to track possibilities</li>
                    <li>
                        Complete faster with fewer mistakes for higher scores
                    </li>
                </ul>
            </div>
            {savedGame && (
                <ResumeGameModal
                    isOpen={showResumeModal}
                    difficulty={savedGame.difficulty}
                    timer={savedGame.timer}
                    onResume={handleResume}
                    onNewGame={handleNewGame}
                />
            )}
            <UsernameModal
                isOpen={showUsernameModal}
                onClose={() => setShowUsernameModal(false)}
            />
        </div>
    );
}
