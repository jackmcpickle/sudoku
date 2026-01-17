import { describe, it, expect } from 'vitest';
import {
    isValidMove,
    getCandidates,
    getAffectedPositions,
} from '@/lib/sudoku/validator';
import type { Grid, CellValue } from '@/types';

const emptyGrid: Grid = Array.from(
    { length: 9 },
    () => Array(9).fill(0) as CellValue[],
);

const partialGrid: Grid = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

describe('isValidMove', () => {
    it('returns true for 0 (empty)', () => {
        expect(isValidMove(partialGrid, 0, 2, 0)).toBe(true);
    });

    it('returns true for valid placement', () => {
        // Position [0,2] - can place 4
        expect(isValidMove(partialGrid, 0, 2, 4)).toBe(true);
    });

    it('returns false when value exists in row', () => {
        // 5 already in row 0
        expect(isValidMove(partialGrid, 0, 2, 5)).toBe(false);
    });

    it('returns false when value exists in column', () => {
        // 6 already in col 0 (row 1)
        expect(isValidMove(partialGrid, 2, 0, 6)).toBe(false);
    });

    it('returns false when value exists in 3x3 box', () => {
        // 5 is in top-left box at [0,0]
        expect(isValidMove(partialGrid, 1, 1, 5)).toBe(false);
    });

    it('allows any 1-9 in empty grid', () => {
        for (let n = 1; n <= 9; n++) {
            expect(isValidMove(emptyGrid, 0, 0, n as CellValue)).toBe(true);
        }
    });
});

describe('getCandidates', () => {
    it('returns empty array for non-empty cell', () => {
        expect(getCandidates(partialGrid, 0, 0)).toEqual([]);
    });

    it('returns valid candidates for empty cell', () => {
        const candidates = getCandidates(partialGrid, 0, 2);
        expect(candidates).toContain(1);
        expect(candidates).toContain(2);
        expect(candidates).toContain(4);
        expect(candidates).not.toContain(3); // in row
        expect(candidates).not.toContain(5); // in row
        expect(candidates).not.toContain(7); // in row
        expect(candidates).not.toContain(8); // in box
    });

    it('returns all numbers for empty grid', () => {
        expect(getCandidates(emptyGrid, 0, 0)).toEqual([
            1, 2, 3, 4, 5, 6, 7, 8, 9,
        ]);
    });
});

describe('getAffectedPositions', () => {
    it('returns 20 affected positions', () => {
        // 8 in row + 8 in col + 4 remaining in box = 20
        const positions = getAffectedPositions(4, 4);
        expect(positions).toHaveLength(20);
    });

    it('excludes the cell itself', () => {
        const positions = getAffectedPositions(0, 0);
        const hasItself = positions.some((p) => p.row === 0 && p.col === 0);
        expect(hasItself).toBe(false);
    });

    it('includes all row cells', () => {
        const positions = getAffectedPositions(0, 0);
        for (let c = 1; c < 9; c++) {
            const found = positions.some((p) => p.row === 0 && p.col === c);
            expect(found).toBe(true);
        }
    });

    it('includes all column cells', () => {
        const positions = getAffectedPositions(0, 0);
        for (let r = 1; r < 9; r++) {
            const found = positions.some((p) => p.row === r && p.col === 0);
            expect(found).toBe(true);
        }
    });

    it('includes box cells', () => {
        const positions = getAffectedPositions(0, 0);
        // [1,1], [1,2], [2,1], [2,2] should be included
        expect(positions.some((p) => p.row === 1 && p.col === 1)).toBe(true);
        expect(positions.some((p) => p.row === 1 && p.col === 2)).toBe(true);
        expect(positions.some((p) => p.row === 2 && p.col === 1)).toBe(true);
        expect(positions.some((p) => p.row === 2 && p.col === 2)).toBe(true);
    });

    it('no duplicates', () => {
        const positions = getAffectedPositions(0, 0);
        const keys = positions.map((p) => `${p.row}-${p.col}`);
        const unique = new Set(keys);
        expect(unique.size).toBe(keys.length);
    });
});
