import type { Difficulty, GameScore, SavedGame } from '@/types'

export interface User {
  username: string
  visitorId: string
  createdAt: string
}

export interface ApiGameScore extends Omit<GameScore, 'userId'> {
  visitorId: string
  username: string
}

export interface ApiSavedGame extends Omit<SavedGame, 'userId'> {
  visitorId: string
}

const API_BASE = '/api'

// Users
export async function createUser(username: string, visitorId: string): Promise<User> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, visitorId }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create user')
  }
  return res.json()
}

export async function getUser(visitorId: string): Promise<User | null> {
  const res = await fetch(`${API_BASE}/users?visitorId=${visitorId}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

// Scores
export async function getScores(difficulty?: Difficulty): Promise<ApiGameScore[]> {
  const url = difficulty
    ? `${API_BASE}/scores?difficulty=${difficulty}`
    : `${API_BASE}/scores`
  const res = await fetch(url)
  if (!res.ok) return []
  return res.json()
}

export async function getUserScores(visitorId: string): Promise<ApiGameScore[]> {
  const res = await fetch(`${API_BASE}/scores?visitorId=${visitorId}`)
  if (!res.ok) return []
  return res.json()
}

export async function submitScore(score: {
  difficulty: Difficulty
  score: number
  timeSeconds: number
  hintsUsed: number
  mistakes: number
  visitorId: string
  username: string
}): Promise<ApiGameScore | null> {
  try {
    const res = await fetch(`${API_BASE}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(score),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// Games
export async function getSavedGame(visitorId: string): Promise<ApiSavedGame | null> {
  try {
    const res = await fetch(`${API_BASE}/games/${visitorId}`)
    if (res.status === 404) return null
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function saveGame(visitorId: string, game: Omit<ApiSavedGame, 'id' | 'updatedAt' | 'visitorId'>): Promise<void> {
  try {
    await fetch(`${API_BASE}/games/${visitorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game),
    })
  } catch {
    // Silent fail - accept data loss
  }
}

export async function deleteGame(visitorId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/games/${visitorId}`, { method: 'DELETE' })
  } catch {
    // Silent fail
  }
}
