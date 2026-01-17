import type { Board } from '@/types'
import { getAffectedPositions } from './validator'

export function clearNotesForValue(board: Board, row: number, col: number, value: number): void {
  const affected = getAffectedPositions(row, col)
  for (const pos of affected) {
    board[pos.row][pos.col].notes.delete(value)
  }
}
