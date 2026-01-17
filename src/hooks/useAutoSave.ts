import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { saveGame, deleteGame } from '@/lib/api';
import type { CellValue } from '@/types';

export function useAutoSave(): { initializedRef: React.MutableRefObject<boolean> } {
    const puzzle = useGameStore((state) => state.puzzle);
    const board = useGameStore((state) => state.board);
    const timer = useGameStore((state) => state.timer);
    const hintsUsed = useGameStore((state) => state.hintsUsed);
    const mistakes = useGameStore((state) => state.mistakes);
    const pointsLost = useGameStore((state) => state.pointsLost);
    const history = useGameStore((state) => state.history);
    const isComplete = useGameStore((state) => state.isComplete);
    const visitorId = useUserStore((state) => state.visitorId);

    const initializedRef = useRef(false);

    // Mark as initialized after first render
    useEffect(() => {
        if (puzzle) {
            initializedRef.current = true;
        }
    }, [puzzle]);

    // Auto-save on every change
    useEffect(() => {
        if (!puzzle || !visitorId || !initializedRef.current || isComplete)
            return;

        const serializedBoard = board.map((row) =>
            row.map((cell) => ({
                value: cell.value as CellValue,
                isGiven: cell.isGiven,
                notes: Array.from(cell.notes),
            })),
        );

        void saveGame(visitorId, {
            difficulty: puzzle.difficulty,
            puzzle: puzzle.grid,
            solution: puzzle.solution,
            board: serializedBoard,
            timer,
            hintsUsed,
            mistakes,
            pointsLost,
            history,
        });
    }, [
        board,
        timer,
        hintsUsed,
        mistakes,
        pointsLost,
        history,
        puzzle,
        visitorId,
        isComplete,
    ]);

    // Delete saved game when complete
    useEffect(() => {
        if (isComplete && visitorId) {
            void deleteGame(visitorId);
        }
    }, [isComplete, visitorId]);

    return { initializedRef };
}
