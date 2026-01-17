export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type Grid = CellValue[][]

export interface Cell {
  value: CellValue
  isGiven: boolean
  notes: Set<number>
}

export type Board = Cell[][]

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'

export interface Puzzle {
  grid: Grid
  solution: Grid
  difficulty: Difficulty
}

export interface Position {
  row: number
  col: number
}

export interface Action {
  type: 'fill' | 'note' | 'erase'
  row: number
  col: number
  prevValue: CellValue
  prevNotes: number[]
}

export interface User {
  username: string
  visitorId: string
  createdAt: string
}

export interface GameScore {
  id: string
  difficulty: Difficulty
  score: number
  timeSeconds: number
  hintsUsed: number
  mistakes: number
  completedAt: string
  userId: string
  username?: string
}

export interface SavedGame {
  id: string
  difficulty: Difficulty
  puzzle: Grid
  solution: Grid
  board: Array<Array<{ value: CellValue; isGiven: boolean; notes: number[] }>>
  timer: number
  hintsUsed: number
  mistakes: number
  pointsLost: number
  history: Action[]
  updatedAt: string
  userId: string
}

export interface DifficultyConfig {
  clueCount: { min: number; max: number }
  baseScore: number
  timeBonusThreshold: number
  hintPenalty: number
  mistakePenalty: number
  difficultyMultiplier: number
  maxHints: number
}
