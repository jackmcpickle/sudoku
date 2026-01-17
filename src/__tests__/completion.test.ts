import { describe, it, expect } from 'vitest';
import { checkCompletion } from '@/lib/sudoku/completion';
import type { Board, Grid, CellValue } from '@/types';

function createBoard(values: CellValue[][]): Board {
    return values.map((row) =>
        row.map((value) => ({
            value,
            isGiven: false,
            notes: new Set<number>(),
        })),
    );
}

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

describe('checkCompletion', () => {
    it('returns true when board matches solution', () => {
        const board = createBoard(solution);
        expect(checkCompletion(board, solution)).toBe(true);
    });

    it('returns false when board has empty cells', () => {
        const values = solution.map((row) => [...row]);
        values[0][0] = 0;
        const board = createBoard(values as Grid);
        expect(checkCompletion(board, solution)).toBe(false);
    });

    it('returns false when board has wrong value', () => {
        const values = solution.map((row) => [...row]);
        values[0][0] = 1; // should be 5
        const board = createBoard(values as Grid);
        expect(checkCompletion(board, solution)).toBe(false);
    });

    it('returns false when multiple cells are wrong', () => {
        const values = solution.map((row) => [...row]);
        values[0][0] = 0;
        values[8][8] = 0;
        const board = createBoard(values as Grid);
        expect(checkCompletion(board, solution)).toBe(false);
    });
});
