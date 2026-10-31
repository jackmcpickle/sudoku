import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useGameStore } from '@/stores/gameStore';
import { NumberPad } from '@/components/controls/NumberPad';
import { useKeyboard } from '@/hooks/useKeyboard';
import type { CellValue, Grid, Puzzle } from '@/types';

const solution: Grid = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

function createPuzzle(): Puzzle {
    const grid = solution.map((row) => [...row]);
    grid[0][0] = 0;
    grid[0][1] = 0;
    grid[8][8] = 0;
    return { grid, solution, difficulty: 'easy' };
}

function KeyboardControls(): React.ReactElement {
    useKeyboard();
    return <NumberPad />;
}

beforeEach(() => {
    useGameStore.getState().newGame(createPuzzle());
    useGameStore.getState().selectCell({ row: 0, col: 0 });
});

afterEach(cleanup);

describe('correct cell locking', () => {
    it.each<CellValue>([1, 0, 5])(
        'ignores subsequent input %i without penalties or extra undo steps',
        (value) => {
            useGameStore.getState().setCell(5);

            useGameStore.getState().setCell(value);

            expect(useGameStore.getState().board[0][0].value).toBe(5);
            expect(useGameStore.getState().mistakes).toBe(0);
            expect(useGameStore.getState().pointsLost).toBe(0);
            expect(useGameStore.getState().history).toHaveLength(1);
        },
    );

    it('keeps wrong entries editable until corrected', () => {
        useGameStore.getState().setCell(1);
        expect(useGameStore.getState().mistakes).toBe(1);
        expect(useGameStore.getState().pointsLost).toBeGreaterThan(0);
        useGameStore.getState().setCell(0);
        expect(useGameStore.getState().board[0][0].value).toBe(0);

        useGameStore.getState().toggleNote(5);
        useGameStore.getState().setCell(5);
        useGameStore.getState().setCell(2);

        expect(useGameStore.getState().board[0][0].value).toBe(5);
        expect(useGameStore.getState().board[0][0].notes.size).toBe(0);
        expect(useGameStore.getState().mistakes).toBe(1);
    });

    it('protects original clues', () => {
        useGameStore.getState().selectCell({ row: 0, col: 2 });
        useGameStore.getState().setCell(1);
        useGameStore.getState().setCell(0);

        expect(useGameStore.getState().board[0][2].value).toBe(4);
        expect(useGameStore.getState().mistakes).toBe(0);
    });

    it('locks correct values when a saved game is resumed', () => {
        useGameStore.getState().setCell(5);
        const saved = useGameStore.getState();
        const puzzle = createPuzzle();

        useGameStore.getState().reset();
        useGameStore.getState().loadGame({
            puzzle: puzzle.grid,
            solution,
            difficulty: puzzle.difficulty,
            board: saved.board.map((row) =>
                row.map((cell) => ({ ...cell, notes: [...cell.notes] })),
            ),
            timer: saved.timer,
            hintsUsed: saved.hintsUsed,
            mistakes: saved.mistakes,
            pointsLost: saved.pointsLost,
            history: saved.history,
        });
        useGameStore.getState().selectCell({ row: 0, col: 0 });
        useGameStore.getState().setCell(1);
        useGameStore.getState().undo();

        expect(useGameStore.getState().board[0][0].value).toBe(5);
        expect(useGameStore.getState().mistakes).toBe(0);
    });

    it('locks hinted answers against overwriting, erasing and undo', () => {
        useGameStore.getState().useHint();
        const selected = useGameStore.getState().selectedCell;
        expect(selected).toEqual({ row: 0, col: 0 });

        useGameStore.getState().setCell(1);
        useGameStore.getState().setCell(0);
        useGameStore.getState().undo();

        expect(useGameStore.getState().board[0][0].value).toBe(5);
        expect(useGameStore.getState().hintsUsed).toBe(1);
        expect(useGameStore.getState().mistakes).toBe(0);
    });

    it('undo skips locked answers and their old edits, but still undoes other mistakes and notes', () => {
        useGameStore.getState().selectCell({ row: 8, col: 8 });
        useGameStore.getState().toggleNote(9);
        useGameStore.getState().selectCell({ row: 0, col: 1 });
        useGameStore.getState().setCell(2);
        useGameStore.getState().selectCell({ row: 0, col: 0 });
        useGameStore.getState().setCell(1);
        useGameStore.getState().setCell(5);

        useGameStore.getState().undo();
        expect(useGameStore.getState().board[0][0].value).toBe(5);
        expect(useGameStore.getState().board[0][1].value).toBe(0);
        expect(useGameStore.getState().board[8][8].notes.has(9)).toBe(true);

        useGameStore.getState().undo();
        expect(useGameStore.getState().board[0][0].value).toBe(5);
        expect(useGameStore.getState().board[8][8].notes.size).toBe(0);
        expect(useGameStore.getState().history).toEqual([]);
    });

    it('prevents accidental keyboard and number-pad edits after a correct entry', () => {
        render(<KeyboardControls />);
        fireEvent.keyDown(window, { key: '5' });
        fireEvent.keyDown(window, { key: '1' });
        fireEvent.keyDown(window, { key: 'Backspace' });
        fireEvent.keyDown(window, { key: 'Delete' });
        fireEvent.click(screen.getByText('3', { selector: 'button' }));
        fireEvent.click(screen.getByRole('button', { name: 'Erase' }));
        fireEvent.keyDown(window, { key: 'n' });
        fireEvent.keyDown(window, { key: '4' });
        fireEvent.keyDown(window, { key: 'z', ctrlKey: true });

        expect(useGameStore.getState().board[0][0].value).toBe(5);
        expect(useGameStore.getState().board[0][0].notes.size).toBe(0);
        expect(useGameStore.getState().mistakes).toBe(0);
        expect(useGameStore.getState().pointsLost).toBe(0);
    });
});
