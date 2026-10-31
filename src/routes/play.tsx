import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useGameState, useGameActions } from '@/hooks/useGameState';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import { generatePuzzle } from '@/lib/sudoku/generator';
import { getSavedGame } from '@/lib/api';
import { Board } from '@/components/board';
import { NumberPad, Timer, GameControls } from '@/components/controls';
import { GameComplete } from '@/components/GameComplete';
import type { Difficulty } from '@/types';

export const Route = createFileRoute('/play')({
    validateSearch: (
        search: Record<string, unknown>,
    ): { difficulty: Difficulty; resume?: boolean } => ({
        difficulty: (search.difficulty as Difficulty) || 'medium',
        resume: search.resume === true || search.resume === 'true',
    }),
    component: PlayPage,
});

function PlayPage(): React.ReactElement {
    const { difficulty, resume } = Route.useSearch();
    const navigate = useNavigate();
    const generatingRef = useRef(false);
    const [checkedSavedGame, setCheckedSavedGame] = useState(
        () => !!useGameStore.getState().puzzle,
    );

    const { puzzle } = useGameState();
    const { newGame, reset } = useGameActions();
    const loadGame = useGameStore((state) => state.loadGame);
    const { initializedRef } = useAutoSave();
    const visitorId = useUserStore((state) => state.visitorId);
    const init = useUserStore((state) => state.init);

    useKeyboard();

    // Init user store to get visitorId
    useEffect(() => {
        void init();
    }, [init]);

    // Check for saved game on mount (handles page refresh)
    useEffect(() => {
        if (puzzle || !visitorId || checkedSavedGame) return;

        let cancelled = false;
        void getSavedGame(visitorId).then((savedGame) => {
            if (cancelled) return;
            if (savedGame && !useGameStore.getState().puzzle) {
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
                initializedRef.current = true;
            }
            setCheckedSavedGame(true);
        });
        return () => {
            cancelled = true;
        };
    }, [visitorId, checkedSavedGame, puzzle, loadGame, initializedRef]);

    useEffect(() => {
        if (puzzle) {
            initializedRef.current = true;
            return;
        }
        // Wait until we've checked for saved game before generating new
        if (!checkedSavedGame) return;

        if (!generatingRef.current) {
            generatingRef.current = true;
            setTimeout(() => {
                const newPuzzle = generatePuzzle(difficulty);
                newGame(newPuzzle);
                initializedRef.current = true;
                generatingRef.current = false;
            }, 50);
        }
    }, [difficulty, puzzle, newGame, initializedRef, checkedSavedGame]);

    const isGenerating = !puzzle;

    function handleNewGame(): void {
        reset();
        void navigate({ to: '/' });
    }

    const isLoading = !checkedSavedGame && !resume && !puzzle;

    if (isLoading || isGenerating || !puzzle) {
        return (
            <div className="max-w-md mx-auto px-4 text-center">
                <div className="animate-pulse">
                    <div className="text-xl text-(--text-muted) mb-4">
                        {isLoading ? 'Loading...' : 'Generating puzzle...'}
                    </div>
                    <div className="w-16 h-16 border-4 border-(--accent) border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <span className="text-sm text-(--text-muted)">
                        Difficulty:{' '}
                    </span>
                    <span className="font-medium capitalize text-(--body-text)">
                        {puzzle.difficulty}
                    </span>
                </div>
                <Timer />
            </div>
            <div className="mb-6">
                <Board />
            </div>
            <div className="space-y-4">
                <NumberPad />
                <GameControls />
                <div className="text-center pt-4">
                    <button
                        onClick={handleNewGame}
                        className="text-sm text-(--text-muted) hover:text-(--text-muted-hover)"
                    >
                        Quit Game
                    </button>
                </div>
            </div>
            <GameComplete />
        </div>
    );
}
