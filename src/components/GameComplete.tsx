import { useNavigate } from '@tanstack/react-router'
import { useGameStore } from '@/stores/gameStore'
import { saveScore } from '@/lib/storage'
import { calculateScore, formatTime } from '@/lib/scoring'
import { Modal, Button } from '@/components/ui'
import { useEffect, useRef } from 'react'

export function GameComplete() {
  const navigate = useNavigate()
  const isComplete = useGameStore(state => state.isComplete)
  const puzzle = useGameStore(state => state.puzzle)
  const timer = useGameStore(state => state.timer)
  const hintsUsed = useGameStore(state => state.hintsUsed)
  const mistakes = useGameStore(state => state.mistakes)
  const userId = useGameStore(state => state.userId)
  const reset = useGameStore(state => state.reset)

  const savedRef = useRef(false)

  useEffect(() => {
    if (isComplete && puzzle && !savedRef.current) {
      savedRef.current = true
      saveScore({
        difficulty: puzzle.difficulty,
        score: calculateScore({
          difficulty: puzzle.difficulty,
          timeSeconds: timer,
          hintsUsed,
          mistakes,
          completed: true,
        }).totalScore,
        timeSeconds: timer,
        hintsUsed,
        mistakes,
        userId,
      })
    }
  }, [isComplete, puzzle, timer, hintsUsed, mistakes, userId])

  if (!isComplete || !puzzle) return null

  const breakdown = calculateScore({
    difficulty: puzzle.difficulty,
    timeSeconds: timer,
    hintsUsed,
    mistakes,
    completed: true,
  })

  const handleNewGame = () => {
    savedRef.current = false
    reset()
    navigate({ to: '/' })
  }

  const handlePlayAgain = () => {
    savedRef.current = false
    reset()
    navigate({ to: '/play', search: { difficulty: puzzle.difficulty } })
  }

  return (
    <Modal isOpen={true} onClose={() => {}} title="Puzzle Complete!">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-green-400 mb-2">{breakdown.totalScore}</div>
          <div className="text-sm text-slate-400">points</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-300"><span>Difficulty</span><span className="font-medium capitalize">{puzzle.difficulty}</span></div>
          <div className="flex justify-between text-slate-300"><span>Time</span><span className="font-medium">{formatTime(timer)}</span></div>
          <div className="flex justify-between text-slate-300"><span>Mistakes</span><span className="font-medium">{mistakes}</span></div>
          <div className="flex justify-between text-slate-300"><span>Hints Used</span><span className="font-medium">{hintsUsed}</span></div>
          <hr className="border-slate-600" />
          <div className="flex justify-between text-slate-300"><span>Base Score</span><span>{breakdown.baseScore}</span></div>
          {breakdown.timeBonus > 0 && <div className="flex justify-between text-green-400"><span>Time Bonus</span><span>+{breakdown.timeBonus}</span></div>}
          {breakdown.hintPenalty > 0 && <div className="flex justify-between text-red-400"><span>Hint Penalty</span><span>-{breakdown.hintPenalty}</span></div>}
          {breakdown.mistakePenalty > 0 && <div className="flex justify-between text-red-400"><span>Mistake Penalty</span><span>-{breakdown.mistakePenalty}</span></div>}
          <div className="flex justify-between text-blue-400"><span>Difficulty Multiplier</span><span>x{breakdown.difficultyMultiplier}</span></div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePlayAgain} className="flex-1">Play Again</Button>
          <Button onClick={handleNewGame} variant="secondary" className="flex-1">New Difficulty</Button>
        </div>
        <Button onClick={() => navigate({ to: '/scores' })} variant="ghost" className="w-full">View Leaderboard</Button>
      </div>
    </Modal>
  )
}
