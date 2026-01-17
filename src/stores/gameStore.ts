import { create } from 'zustand'
import type { Action, Board, CellValue, Difficulty, Grid, Position, Puzzle } from '@/types'
import { getAffectedPositions } from '@/lib/sudoku/validator'
import { getUserId } from '@/lib/storage'

interface GameState {
  puzzle: Puzzle | null
  board: Board
  solution: Grid
  selectedCell: Position | null
  isNotesMode: boolean
  timer: number
  hintsUsed: number
  mistakes: number
  history: Action[]
  isComplete: boolean
  isPaused: boolean
  userId: string

  newGame: (puzzle: Puzzle) => void
  loadGame: (data: {
    puzzle: Grid
    solution: Grid
    difficulty: Difficulty
    board: Array<Array<{ value: CellValue; isGiven: boolean; notes: number[] }>>
    timer: number
    hintsUsed: number
    mistakes: number
    history: Action[]
  }) => void
  selectCell: (pos: Position | null) => void
  setCell: (value: CellValue) => void
  toggleNote: (value: number) => void
  toggleNotesMode: () => void
  useHint: () => void
  undo: () => void
  tick: () => void
  pause: () => void
  resume: () => void
  reset: () => void
}

function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({
      value: 0 as CellValue,
      isGiven: false,
      notes: new Set<number>(),
    }))
  )
}

function boardFromPuzzle(grid: Grid): Board {
  return grid.map(row =>
    row.map(value => ({
      value,
      isGiven: value !== 0,
      notes: new Set<number>(),
    }))
  )
}

function clearNotesForValue(board: Board, row: number, col: number, value: number): void {
  const affected = getAffectedPositions(row, col)
  for (const pos of affected) {
    board[pos.row][pos.col].notes.delete(value)
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  puzzle: null,
  board: createEmptyBoard(),
  solution: [],
  selectedCell: null,
  isNotesMode: false,
  timer: 0,
  hintsUsed: 0,
  mistakes: 0,
  history: [],
  isComplete: false,
  isPaused: false,
  userId: getUserId(),

  newGame: (puzzle) => {
    set({
      puzzle,
      board: boardFromPuzzle(puzzle.grid),
      solution: puzzle.solution,
      selectedCell: null,
      isNotesMode: false,
      timer: 0,
      hintsUsed: 0,
      mistakes: 0,
      history: [],
      isComplete: false,
      isPaused: false,
    })
  },

  loadGame: (data) => {
    const board: Board = data.board.map(row =>
      row.map(cell => ({
        value: cell.value,
        isGiven: cell.isGiven,
        notes: new Set(cell.notes),
      }))
    )
    set({
      puzzle: { grid: data.puzzle, solution: data.solution, difficulty: data.difficulty },
      board,
      solution: data.solution,
      timer: data.timer,
      hintsUsed: data.hintsUsed,
      mistakes: data.mistakes,
      history: data.history,
      selectedCell: null,
      isNotesMode: false,
      isComplete: false,
      isPaused: false,
    })
  },

  selectCell: (pos) => set({ selectedCell: pos }),

  setCell: (value) => {
    const { selectedCell, board, solution, isNotesMode, history, isComplete } = get()
    if (!selectedCell || isComplete) return

    const { row, col } = selectedCell
    const cell = board[row][col]
    if (cell.isGiven) return

    if (isNotesMode) {
      get().toggleNote(value)
      return
    }

    const action: Action = {
      type: value === 0 ? 'erase' : 'fill',
      row,
      col,
      prevValue: cell.value,
      prevNotes: Array.from(cell.notes),
    }

    const newBoard = board.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })))
    newBoard[row][col].value = value
    newBoard[row][col].notes.clear()

    let newMistakes = get().mistakes
    const isCorrect = value === 0 || solution[row][col] === value

    if (!isCorrect) newMistakes++
    if (isCorrect && value !== 0) clearNotesForValue(newBoard, row, col, value)

    let complete = true
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c].value !== solution[r][c]) {
          complete = false
          break
        }
      }
      if (!complete) break
    }

    set({
      board: newBoard,
      mistakes: newMistakes,
      history: [...history, action],
      isComplete: complete,
    })
  },

  toggleNote: (value) => {
    const { selectedCell, board, history, isComplete } = get()
    if (!selectedCell || isComplete) return

    const { row, col } = selectedCell
    const cell = board[row][col]
    if (cell.isGiven || cell.value !== 0) return

    const action: Action = {
      type: 'note',
      row,
      col,
      prevValue: cell.value,
      prevNotes: Array.from(cell.notes),
    }

    const newBoard = board.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })))
    const notes = newBoard[row][col].notes
    if (notes.has(value)) notes.delete(value)
    else notes.add(value)

    set({ board: newBoard, history: [...history, action] })
  },

  toggleNotesMode: () => set(state => ({ isNotesMode: !state.isNotesMode })),

  useHint: () => {
    const { selectedCell, board, solution, hintsUsed, puzzle, history, isComplete } = get()
    if (!selectedCell || isComplete || !puzzle) return

    const { row, col } = selectedCell
    const cell = board[row][col]
    if (cell.isGiven) return

    const action: Action = {
      type: 'fill',
      row,
      col,
      prevValue: cell.value,
      prevNotes: Array.from(cell.notes),
    }

    const correctValue = solution[row][col]
    const newBoard = board.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })))
    newBoard[row][col].value = correctValue
    newBoard[row][col].notes.clear()
    clearNotesForValue(newBoard, row, col, correctValue)

    let complete = true
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c].value !== solution[r][c]) {
          complete = false
          break
        }
      }
      if (!complete) break
    }

    set({
      board: newBoard,
      hintsUsed: hintsUsed + 1,
      history: [...history, action],
      isComplete: complete,
    })
  },

  undo: () => {
    const { history, board } = get()
    if (history.length === 0) return

    const lastAction = history[history.length - 1]
    const { row, col, prevValue, prevNotes } = lastAction

    const newBoard = board.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })))
    newBoard[row][col].value = prevValue
    newBoard[row][col].notes = new Set(prevNotes)

    set({ board: newBoard, history: history.slice(0, -1) })
  },

  tick: () => {
    const { isPaused, isComplete } = get()
    if (isPaused || isComplete) return
    set(state => ({ timer: state.timer + 1 }))
  },

  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),

  reset: () => set({
    puzzle: null,
    board: createEmptyBoard(),
    solution: [],
    selectedCell: null,
    isNotesMode: false,
    timer: 0,
    hintsUsed: 0,
    mistakes: 0,
    history: [],
    isComplete: false,
    isPaused: false,
  }),
}))
