import type { Difficulty, GameScore, SavedGame } from '@/types'

const GAMES_KEY = 'sudoku-games'
const SCORES_KEY = 'sudoku-scores'
const USER_ID_KEY = 'sudoku-user-id'

export function getUserId(): string {
  const stored = localStorage.getItem(USER_ID_KEY)
  if (stored) return stored
  const id = crypto.randomUUID()
  localStorage.setItem(USER_ID_KEY, id)
  return id
}

// Games
export function getSavedGames(userId?: string): SavedGame[] {
  const data = localStorage.getItem(GAMES_KEY)
  if (!data) return []
  const games: SavedGame[] = JSON.parse(data)
  return userId ? games.filter(g => g.userId === userId) : games
}

export function getSavedGame(id: string): SavedGame | null {
  const games = getSavedGames()
  return games.find(g => g.id === id) || null
}

export function saveGame(game: Omit<SavedGame, 'id'>): SavedGame {
  const games = getSavedGames()
  const newGame: SavedGame = {
    ...game,
    id: crypto.randomUUID(),
  }
  games.push(newGame)
  localStorage.setItem(GAMES_KEY, JSON.stringify(games))
  return newGame
}

export function updateGame(id: string, data: Partial<SavedGame>): SavedGame | null {
  const games = getSavedGames()
  const index = games.findIndex(g => g.id === id)
  if (index === -1) return null
  games[index] = { ...games[index], ...data, updatedAt: new Date().toISOString() }
  localStorage.setItem(GAMES_KEY, JSON.stringify(games))
  return games[index]
}

export function deleteGame(id: string): void {
  const games = getSavedGames().filter(g => g.id !== id)
  localStorage.setItem(GAMES_KEY, JSON.stringify(games))
}

// Scores
export function getScores(difficulty?: Difficulty, limit?: number): GameScore[] {
  const data = localStorage.getItem(SCORES_KEY)
  if (!data) return []
  let scores: GameScore[] = JSON.parse(data)
  if (difficulty) {
    scores = scores.filter(s => s.difficulty === difficulty)
  }
  scores.sort((a, b) => b.score - a.score)
  if (limit) {
    scores = scores.slice(0, limit)
  }
  return scores
}

export function getUserScores(userId: string): GameScore[] {
  const data = localStorage.getItem(SCORES_KEY)
  if (!data) return []
  return (JSON.parse(data) as GameScore[]).filter(s => s.userId === userId)
}

export function saveScore(score: Omit<GameScore, 'id' | 'completedAt'>): GameScore {
  const data = localStorage.getItem(SCORES_KEY)
  const scores: GameScore[] = data ? JSON.parse(data) : []
  const newScore: GameScore = {
    ...score,
    id: crypto.randomUUID(),
    completedAt: new Date().toISOString(),
  }
  scores.push(newScore)
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores))
  return newScore
}

export function getUserStats(userId: string) {
  const scores = getUserScores(userId)
  return {
    totalGames: scores.length,
    totalScore: scores.reduce((sum, s) => sum + s.score, 0),
    averageScore: scores.length > 0
      ? Math.floor(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
      : 0,
    bestScoreByDifficulty: (['beginner', 'easy', 'medium', 'hard', 'expert'] as Difficulty[]).reduce(
      (acc, d) => {
        const diffScores = scores.filter(s => s.difficulty === d)
        acc[d] = diffScores.length > 0
          ? diffScores.reduce((best, s) => s.score > best.score ? s : best)
          : null
        return acc
      },
      {} as Record<Difficulty, GameScore | null>
    ),
    recentScores: scores
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 10),
  }
}
