import { useGameStore } from '@/stores/gameStore'

export function useGameState() {
  const puzzle = useGameStore(state => state.puzzle)
  const board = useGameStore(state => state.board)
  const timer = useGameStore(state => state.timer)
  const hintsUsed = useGameStore(state => state.hintsUsed)
  const mistakes = useGameStore(state => state.mistakes)
  const pointsLost = useGameStore(state => state.pointsLost)
  const history = useGameStore(state => state.history)
  const isComplete = useGameStore(state => state.isComplete)
  const userId = useGameStore(state => state.userId)

  return {
    puzzle,
    board,
    timer,
    hintsUsed,
    mistakes,
    pointsLost,
    history,
    isComplete,
    userId,
  }
}

export function useGameActions() {
  const newGame = useGameStore(state => state.newGame)
  const reset = useGameStore(state => state.reset)

  return { newGame, reset }
}
