import { useGameStore } from '@/stores/gameStore';
import type { Board, Action, Puzzle } from '@/types';

interface GameState {
    puzzle: Puzzle | null;
    board: Board;
    timer: number;
    hintsUsed: number;
    mistakes: number;
    pointsLost: number;
    history: Action[];
    isComplete: boolean;
    userId: string;
}

export function useGameState(): GameState {
    const puzzle = useGameStore((state) => state.puzzle);
    const board = useGameStore((state) => state.board);
    const timer = useGameStore((state) => state.timer);
    const hintsUsed = useGameStore((state) => state.hintsUsed);
    const mistakes = useGameStore((state) => state.mistakes);
    const pointsLost = useGameStore((state) => state.pointsLost);
    const history = useGameStore((state) => state.history);
    const isComplete = useGameStore((state) => state.isComplete);
    const userId = useGameStore((state) => state.userId);

    return {
        puzzle,
        board,
        timer,
        hintsUsed,
        mistakes,
        pointsLost,
        history,
        isComplete,
        userId,
    };
}

interface GameActions {
    newGame: (puzzle: Puzzle) => void;
    reset: () => void;
}

export function useGameActions(): GameActions {
    const newGame = useGameStore((state) => state.newGame);
    const reset = useGameStore((state) => state.reset);

    return { newGame, reset };
}
