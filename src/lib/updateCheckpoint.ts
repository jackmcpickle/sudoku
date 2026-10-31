import { z } from 'zod';
import { useGameStore } from '@/stores/gameStore';

const key = 'sudoku-update-checkpoint';
const cellValue = z.literal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const grid = z.array(z.array(cellValue).length(9)).length(9);
const position = z.object({
    row: z.number().int().min(0).max(8),
    col: z.number().int().min(0).max(8),
});
const notes = z.array(z.number().int().min(1).max(9));
const counter = z.number().int().nonnegative();
const checkpoint = z.object({
    schema: z.literal(1),
    owner: z.string(),
    game: z.object({
        puzzle: z.object({
            grid,
            solution: grid,
            difficulty: z.enum([
                'beginner',
                'easy',
                'medium',
                'hard',
                'expert',
            ]),
        }),
        board: z
            .array(
                z
                    .array(
                        z.object({
                            value: cellValue,
                            isGiven: z.boolean(),
                            notes,
                        }),
                    )
                    .length(9),
            )
            .length(9),
        timer: counter,
        hintsUsed: counter,
        mistakes: counter,
        pointsLost: counter,
        history: z.array(
            position.extend({
                type: z.enum(['fill', 'note', 'erase']),
                prevValue: cellValue,
                prevNotes: notes,
            }),
        ),
        selectedCell: position.nullable(),
        isNotesMode: z.boolean(),
        isPaused: z.boolean(),
    }),
});

export function saveUpdateCheckpoint(): void {
    const state = useGameStore.getState();
    if (state.isComplete) {
        throw new Error('Leave the completed puzzle before updating.');
    }
    if (!state.puzzle) {
        sessionStorage.removeItem(key);
        return;
    }
    const {
        puzzle,
        board,
        timer,
        hintsUsed,
        mistakes,
        pointsLost,
        history,
        selectedCell,
        isNotesMode,
        isPaused,
    } = state;
    sessionStorage.setItem(
        key,
        JSON.stringify({
            schema: 1,
            owner: localStorage.getItem('sudoku-visitor-id') || '',
            game: {
                puzzle,
                board: board.map((row) =>
                    row.map((cell) => ({ ...cell, notes: [...cell.notes] })),
                ),
                timer,
                hintsUsed,
                mistakes,
                pointsLost,
                history,
                selectedCell,
                isNotesMode,
                isPaused,
            },
        }),
    );
}

export function restoreUpdateCheckpoint(): void {
    const raw = sessionStorage.getItem(key);
    if (!raw) return;
    const saved = checkpoint.parse(JSON.parse(raw));
    if (saved.owner !== (localStorage.getItem('sudoku-visitor-id') || '')) {
        sessionStorage.removeItem(key);
        return;
    }
    const { game } = saved;
    useGameStore.getState().loadGame({
        ...game,
        puzzle: game.puzzle.grid,
        solution: game.puzzle.solution,
        difficulty: game.puzzle.difficulty,
    });
    useGameStore.setState({
        selectedCell: game.selectedCell,
        isNotesMode: game.isNotesMode,
        isPaused: game.isPaused,
    });
}

// Keep a restored checkpoint current through further refreshes, even offline.
// Never create one until the user has explicitly chosen to update.
useGameStore.subscribe((state) => {
    try {
        if (!sessionStorage.getItem(key)) return;
        if (!state.puzzle || state.isComplete) sessionStorage.removeItem(key);
        else saveUpdateCheckpoint();
    } catch {
        // The explicit update action retries storage and refuses to reload on failure.
    }
});
