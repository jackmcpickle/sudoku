import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useUserStore } from '@/stores/userStore'
import { useKeyboard } from '@/hooks/useKeyboard'
import { generatePuzzle } from '@/lib/sudoku/generator'
import { saveGame, deleteGame } from '@/lib/api'
import { Board } from '@/components/board'
import { NumberPad, Timer, GameControls } from '@/components/controls'
import { GameComplete } from '@/components/GameComplete'
import type { Difficulty, CellValue } from '@/types'

export const Route = createFileRoute('/play')({
  validateSearch: (search: Record<string, unknown>): { difficulty: Difficulty; resume?: boolean } => ({
    difficulty: (search.difficulty as Difficulty) || 'medium',
    resume: search.resume === true || search.resume === 'true',
  }),
  component: PlayPage,
})

function PlayPage() {
  const { difficulty, resume } = Route.useSearch()
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const initializedRef = useRef(false)

  const puzzle = useGameStore(state => state.puzzle)
  const board = useGameStore(state => state.board)
  const timer = useGameStore(state => state.timer)
  const hintsUsed = useGameStore(state => state.hintsUsed)
  const mistakes = useGameStore(state => state.mistakes)
  const pointsLost = useGameStore(state => state.pointsLost)
  const history = useGameStore(state => state.history)
  const isComplete = useGameStore(state => state.isComplete)
  const newGame = useGameStore(state => state.newGame)
  const reset = useGameStore(state => state.reset)
  const visitorId = useUserStore(state => state.visitorId)

  useKeyboard()

  useEffect(() => {
    if (resume && puzzle) {
      initializedRef.current = true
      return
    }
    if (!puzzle || puzzle.difficulty !== difficulty) {
      setIsGenerating(true)
      setTimeout(() => {
        const newPuzzle = generatePuzzle(difficulty)
        newGame(newPuzzle)
        initializedRef.current = true
        setIsGenerating(false)
      }, 50)
    } else {
      initializedRef.current = true
    }
  }, [difficulty, puzzle, newGame, resume])

  // Auto-save on every change
  useEffect(() => {
    if (!puzzle || !visitorId || !initializedRef.current || isComplete) return

    const serializedBoard = board.map(row =>
      row.map(cell => ({
        value: cell.value as CellValue,
        isGiven: cell.isGiven,
        notes: Array.from(cell.notes),
      }))
    )

    saveGame(visitorId, {
      difficulty: puzzle.difficulty,
      puzzle: puzzle.grid,
      solution: puzzle.solution,
      board: serializedBoard,
      timer,
      hintsUsed,
      mistakes,
      pointsLost,
      history,
    })
  }, [board, timer, hintsUsed, mistakes, pointsLost, history, puzzle, visitorId, isComplete])

  // Delete saved game when complete
  useEffect(() => {
    if (isComplete && visitorId) {
      deleteGame(visitorId)
    }
  }, [isComplete, visitorId])

  const handleNewGame = () => {
    reset()
    navigate({ to: '/' })
  }

  if (isGenerating || !puzzle) {
    return (
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="animate-pulse">
          <div className="text-xl text-slate-400 mb-4">Generating puzzle...</div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm text-slate-400">Difficulty: </span>
          <span className="font-medium capitalize text-white">{puzzle.difficulty}</span>
        </div>
        <Timer />
      </div>
      <div className="mb-6"><Board /></div>
      <div className="space-y-4">
        <NumberPad />
        <GameControls />
        <div className="text-center pt-4">
          <button onClick={handleNewGame} className="text-sm text-slate-500 hover:text-slate-300">Quit Game</button>
        </div>
      </div>
      <GameComplete />
    </div>
  )
}
