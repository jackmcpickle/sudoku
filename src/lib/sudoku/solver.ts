import type { CellValue, Grid, Position } from '@/types';
import { getCandidates, isValidMove } from './validator';

function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function findEmptyCell(grid: Grid): Position | null {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c] === 0) return { row: r, col: c };
        }
    }
    return null;
}

function findMRVCell(grid: Grid): Position | null {
    let minCandidates = 10;
    let minCell: Position | null = null;

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c] === 0) {
                const candidates = getCandidates(grid, r, c);
                if (candidates.length < minCandidates) {
                    minCandidates = candidates.length;
                    minCell = { row: r, col: c };
                    if (minCandidates === 1) return minCell;
                }
            }
        }
    }

    return minCell;
}

export function solve(grid: Grid): boolean {
    const empty = findMRVCell(grid);
    if (!empty) return true;

    const { row, col } = empty;
    const candidates = shuffle(getCandidates(grid, row, col));

    for (const num of candidates) {
        grid[row][col] = num;
        if (solve(grid)) return true;
        grid[row][col] = 0;
    }

    return false;
}

export function countSolutions(grid: Grid, limit = 2): number {
    let count = 0;

    function backtrack(): boolean {
        const empty = findEmptyCell(grid);
        if (!empty) {
            count++;
            return count >= limit;
        }

        const { row, col } = empty;
        for (let num = 1; num <= 9; num++) {
            if (isValidMove(grid, row, col, num as CellValue)) {
                grid[row][col] = num as CellValue;
                if (backtrack()) {
                    grid[row][col] = 0;
                    return true;
                }
                grid[row][col] = 0;
            }
        }
        return false;
    }

    backtrack();
    return count;
}

export function hasUniqueSolution(grid: Grid): boolean {
    const copy = grid.map((row) => [...row]) as Grid;
    return countSolutions(copy, 2) === 1;
}
