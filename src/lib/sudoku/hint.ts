import type { Board, Grid, Position } from '@/types';
import { getCandidates } from './validator';

/**
 * Converts a Board (with Cell objects) to a Grid (just values) for candidate calculation
 */
function boardToGrid(board: Board): Grid {
    return board.map((row) => row.map((cell) => cell.value));
}

/**
 * Calculates the Manhattan distance between two positions
 */
function getDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
}

/**
 * Checks if two positions share the same row, column, or 3x3 box
 */
function sharesUnit(pos1: Position, pos2: Position): boolean {
    // Same row
    if (pos1.row === pos2.row) return true;
    // Same column
    if (pos1.col === pos2.col) return true;
    // Same 3x3 box
    const box1Row = Math.floor(pos1.row / 3);
    const box1Col = Math.floor(pos1.col / 3);
    const box2Row = Math.floor(pos2.row / 3);
    const box2Col = Math.floor(pos2.col / 3);
    return box1Row === box2Row && box1Col === box2Col;
}

interface HintCandidate {
    position: Position;
    candidateCount: number;
    distance: number;
    sharesUnitWithSelected: boolean;
    inSameRow: boolean;
    inSameCol: boolean;
}

/**
 * Finds the best cell to give a hint for.
 *
 * Priority order:
 * 1. Cells with fewer candidates (naked singles with 1 candidate are best)
 * 2. If selectedCell exists, prefer cells in the same row/column
 * 3. Closer cells (by Manhattan distance) are preferred
 *
 * @param board - The current game board
 * @param selectedCell - The currently selected cell (optional)
 * @returns The best position for a hint, or null if no empty cells exist
 */
export function findBestHintCell(
    board: Board,
    selectedCell: Position | null,
): Position | null {
    const grid = boardToGrid(board);
    const candidates: HintCandidate[] = [];

    // Find all empty, non-given cells and calculate their candidates
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = board[row][col];

            // Skip given cells and already filled cells
            if (cell.isGiven || cell.value !== 0) continue;

            const position: Position = { row, col };
            const cellCandidates = getCandidates(grid, row, col);

            // Skip cells with no candidates (shouldn't happen in valid puzzles)
            if (cellCandidates.length === 0) continue;

            const distance = selectedCell
                ? getDistance(position, selectedCell)
                : row + col; // Default: prefer top-left if no selection

            candidates.push({
                position,
                candidateCount: cellCandidates.length,
                distance,
                sharesUnitWithSelected: selectedCell
                    ? sharesUnit(position, selectedCell)
                    : false,
                inSameRow: selectedCell ? position.row === selectedCell.row : false,
                inSameCol: selectedCell ? position.col === selectedCell.col : false,
            });
        }
    }

    if (candidates.length === 0) return null;

    // Sort candidates by priority
    candidates.sort((a, b) => {
        // 1. Fewer candidates is better (naked singles first)
        if (a.candidateCount !== b.candidateCount) {
            return a.candidateCount - b.candidateCount;
        }

        // 2. If selected cell exists, prefer cells in same row/column
        if (a.inSameRow !== b.inSameRow) {
            return a.inSameRow ? -1 : 1;
        }
        if (a.inSameCol !== b.inSameCol) {
            return a.inSameCol ? -1 : 1;
        }

        // 3. Prefer cells that share a unit with selected cell
        if (a.sharesUnitWithSelected !== b.sharesUnitWithSelected) {
            return a.sharesUnitWithSelected ? -1 : 1;
        }

        // 4. Closer cells are better
        return a.distance - b.distance;
    });

    return candidates[0].position;
}
