import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui'
import { DIFFICULTIES } from '@/lib/sudoku/difficulty'
import type { Difficulty } from '@/types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()

  const handleStart = (difficulty: Difficulty) => {
    navigate({ to: '/play', search: { difficulty } })
  }

  return (
    <div className="max-w-md mx-auto px-4 text-center">
      <h1 className="text-4xl font-bold text-white mb-2">Sudoku</h1>
      <p className="text-slate-400 mb-8">Select a difficulty to start</p>
      <div className="space-y-3">
        {DIFFICULTIES.map(difficulty => (
          <Button
            key={difficulty}
            onClick={() => handleStart(difficulty)}
            variant="secondary"
            size="lg"
            className="w-full capitalize"
          >
            {difficulty}
          </Button>
        ))}
      </div>
      <div className="mt-12 text-sm text-slate-500">
        <p className="mb-2">How to play:</p>
        <ul className="text-left space-y-1 max-w-xs mx-auto">
          <li>Fill the 9x9 grid with numbers 1-9</li>
          <li>Each row, column, and 3x3 box must contain all digits 1-9</li>
          <li>Use notes (N key) to track possibilities</li>
          <li>Complete faster with fewer mistakes for higher scores</li>
        </ul>
      </div>
    </div>
  )
}
