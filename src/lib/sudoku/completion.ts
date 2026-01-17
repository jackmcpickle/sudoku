import type { Board, Grid } from '@/types'

export function checkCompletion(board: Board, solution: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value !== solution[r][c]) {
        return false
      }
    }
  }
  return true
}
