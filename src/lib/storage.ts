import type { Difficulty, GameScore, SavedGame } from '@/types'
import { filterScores, sortScoresByScore, limitScores, aggregateStats } from './storage-pure'

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
  const scores: GameScore[] = JSON.parse(data)
  let result = filterScores(scores, difficulty)
  result = sortScoresByScore(result)
  if (limit) result = limitScores(result, limit)
  return result
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
  return aggregateStats(scores)
}
