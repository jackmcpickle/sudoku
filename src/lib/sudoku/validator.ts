import type { CellValue, Grid, Position } from '@/types';

export function isValidMove(
    grid: Grid,
    row: number,
    col: number,
    value: CellValue,
): boolean {
    if (value === 0) return true;
    return (
        !rowContains(grid, row, value, col) &&
        !colContains(grid, col, value, row) &&
        !boxContains(grid, row, col, value)
    );
}

function rowContains(
    grid: Grid,
    row: number,
    value: CellValue,
    excludeCol?: number,
): boolean {
    for (let c = 0; c < 9; c++) {
        if (c !== excludeCol && grid[row][c] === value) return true;
    }
    return false;
}

function colContains(
    grid: Grid,
    col: number,
    value: CellValue,
    excludeRow?: number,
): boolean {
    for (let r = 0; r < 9; r++) {
        if (r !== excludeRow && grid[r][col] === value) return true;
    }
    return false;
}

function boxContains(
    grid: Grid,
    row: number,
    col: number,
    value: CellValue,
): boolean {
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if (r !== row || c !== col) {
                if (grid[r][c] === value) return true;
            }
        }
    }
    return false;
}

export function getCandidates(
    grid: Grid,
    row: number,
    col: number,
): CellValue[] {
    if (grid[row][col] !== 0) return [];
    const candidates: CellValue[] = [];
    for (let n = 1; n <= 9; n++) {
        if (isValidMove(grid, row, col, n as CellValue)) {
            candidates.push(n as CellValue);
        }
    }
    return candidates;
}

export function getAffectedPositions(row: number, col: number): Position[] {
    const positions: Position[] = [];
    const seen = new Set<string>();

    const add = (r: number, c: number) => {
        const key = `${r}-${c}`;
        if (!seen.has(key) && (r !== row || c !== col)) {
            seen.add(key);
            positions.push({ row: r, col: c });
        }
    };

    for (let c = 0; c < 9; c++) add(row, c);
    for (let r = 0; r < 9; r++) add(r, col);

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            add(r, c);
        }
    }

    return positions;
}
