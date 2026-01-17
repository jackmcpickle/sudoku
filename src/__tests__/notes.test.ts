import { describe, it, expect } from 'vitest'
import { clearNotesForValue } from '@/lib/sudoku/notes'
import type { Board, CellValue } from '@/types'

function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({
      value: 0 as CellValue,
      isGiven: false,
      notes: new Set<number>(),
    }))
  )
}

describe('clearNotesForValue', () => {
  it('clears notes from cells in same row', () => {
    const board = createEmptyBoard()
    board[0][5].notes.add(5)
    board[0][8].notes.add(5)

    clearNotesForValue(board, 0, 0, 5)

    expect(board[0][5].notes.has(5)).toBe(false)
    expect(board[0][8].notes.has(5)).toBe(false)
  })

  it('clears notes from cells in same column', () => {
    const board = createEmptyBoard()
    board[3][0].notes.add(7)
    board[7][0].notes.add(7)

    clearNotesForValue(board, 0, 0, 7)

    expect(board[3][0].notes.has(7)).toBe(false)
    expect(board[7][0].notes.has(7)).toBe(false)
  })

  it('clears notes from cells in same 3x3 box', () => {
    const board = createEmptyBoard()
    board[1][1].notes.add(3)
    board[2][2].notes.add(3)

    clearNotesForValue(board, 0, 0, 3)

    expect(board[1][1].notes.has(3)).toBe(false)
    expect(board[2][2].notes.has(3)).toBe(false)
  })

  it('does not affect unrelated cells', () => {
    const board = createEmptyBoard()
    board[5][5].notes.add(4) // different row, col, box

    clearNotesForValue(board, 0, 0, 4)

    expect(board[5][5].notes.has(4)).toBe(true)
  })

  it('only clears the specified value', () => {
    const board = createEmptyBoard()
    board[0][5].notes.add(1)
    board[0][5].notes.add(2)
    board[0][5].notes.add(3)

    clearNotesForValue(board, 0, 0, 2)

    expect(board[0][5].notes.has(1)).toBe(true)
    expect(board[0][5].notes.has(2)).toBe(false)
    expect(board[0][5].notes.has(3)).toBe(true)
  })

  it('works for center cell affecting multiple boxes', () => {
    const board = createEmptyBoard()
    // row cells
    board[4][0].notes.add(9)
    board[4][8].notes.add(9)
    // col cells
    board[0][4].notes.add(9)
    board[8][4].notes.add(9)
    // box cells
    board[3][3].notes.add(9)
    board[5][5].notes.add(9)

    clearNotesForValue(board, 4, 4, 9)

    expect(board[4][0].notes.has(9)).toBe(false)
    expect(board[4][8].notes.has(9)).toBe(false)
    expect(board[0][4].notes.has(9)).toBe(false)
    expect(board[8][4].notes.has(9)).toBe(false)
    expect(board[3][3].notes.has(9)).toBe(false)
    expect(board[5][5].notes.has(9)).toBe(false)
  })
})
