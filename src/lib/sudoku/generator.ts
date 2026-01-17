import type { CellValue, Difficulty, Grid, Puzzle } from '@/types'
import { DIFFICULTY_CONFIG } from './difficulty'
import { solve, hasUniqueSolution } from './solver'

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function createEmptyGrid(): Grid {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => 0 as CellValue)
  )
}

function fillDiagonalBoxes(grid: Grid): void {
  for (const boxStart of [0, 3, 6]) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]) as CellValue[]
    let idx = 0
    for (let r = boxStart; r < boxStart + 3; r++) {
      for (let c = boxStart; c < boxStart + 3; c++) {
        grid[r][c] = nums[idx++]
      }
    }
  }
}

function generateSolvedGrid(): Grid {
  const grid = createEmptyGrid()
  fillDiagonalBoxes(grid)
  solve(grid)
  return grid
}

function getAllPositions(): [number, number][] {
  const positions: [number, number][] = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c])
    }
  }
  return positions
}

function createPuzzleFromSolution(solution: Grid, difficulty: Difficulty): Grid {
  const puzzle = solution.map(row => [...row]) as Grid
  const config = DIFFICULTY_CONFIG[difficulty]
  const targetClues = Math.floor(
    Math.random() * (config.clueCount.max - config.clueCount.min + 1) + config.clueCount.min
  )
  const cellsToRemove = 81 - targetClues

  const positions = shuffle(getAllPositions())
  let removed = 0

  for (const [row, col] of positions) {
    if (removed >= cellsToRemove) break
    if (puzzle[row][col] === 0) continue

    const backup = puzzle[row][col]
    puzzle[row][col] = 0

    if (hasUniqueSolution(puzzle)) {
      removed++
    } else {
      puzzle[row][col] = backup
    }
  }

  return puzzle
}

export function generatePuzzle(difficulty: Difficulty): Puzzle {
  const solution = generateSolvedGrid()
  const grid = createPuzzleFromSolution(solution, difficulty)

  return {
    grid,
    solution,
    difficulty,
  }
}
