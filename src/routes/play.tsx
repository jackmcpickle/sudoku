import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useGameState, useGameActions } from '@/hooks/useGameState'
import { useAutoSave } from '@/hooks/useAutoSave'
import { generatePuzzle } from '@/lib/sudoku/generator'
import { Board } from '@/components/board'
import { NumberPad, Timer, GameControls } from '@/components/controls'
import { GameComplete } from '@/components/GameComplete'
import type { Difficulty } from '@/types'

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
  const generatingRef = useRef(false)

  const { puzzle } = useGameState()
  const { newGame, reset } = useGameActions()
  const { initializedRef } = useAutoSave()

  useKeyboard()

  useEffect(() => {
    if (resume && puzzle) {
      initializedRef.current = true
      return
    }
    if ((!puzzle || puzzle.difficulty !== difficulty) && !generatingRef.current) {
      generatingRef.current = true
      setTimeout(() => {
        const newPuzzle = generatePuzzle(difficulty)
        newGame(newPuzzle)
        initializedRef.current = true
        generatingRef.current = false
      }, 50)
    } else if (puzzle) {
      initializedRef.current = true
    }
  }, [difficulty, puzzle, newGame, resume, initializedRef])

  const isGenerating = !puzzle || (puzzle.difficulty !== difficulty && !resume)

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
