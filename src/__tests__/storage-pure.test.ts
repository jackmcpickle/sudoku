import { describe, it, expect } from 'vitest'
import {
  filterScores,
  sortScoresByScore,
  sortScoresByDate,
  limitScores,
  aggregateStats,
} from '@/lib/storage-pure'
import type { GameScore } from '@/types'

const mockScores: GameScore[] = [
  { id: '1', difficulty: 'easy', score: 200, timeSeconds: 300, hintsUsed: 0, mistakes: 0, completedAt: '2024-01-01T10:00:00Z', userId: 'u1' },
  { id: '2', difficulty: 'medium', score: 500, timeSeconds: 400, hintsUsed: 1, mistakes: 1, completedAt: '2024-01-02T10:00:00Z', userId: 'u1' },
  { id: '3', difficulty: 'easy', score: 300, timeSeconds: 250, hintsUsed: 0, mistakes: 0, completedAt: '2024-01-03T10:00:00Z', userId: 'u1' },
  { id: '4', difficulty: 'hard', score: 1000, timeSeconds: 600, hintsUsed: 2, mistakes: 3, completedAt: '2024-01-04T10:00:00Z', userId: 'u1' },
]

describe('filterScores', () => {
  it('returns all scores when no difficulty specified', () => {
    expect(filterScores(mockScores)).toEqual(mockScores)
  })

  it('filters by difficulty', () => {
    const result = filterScores(mockScores, 'easy')
    expect(result).toHaveLength(2)
    expect(result.every(s => s.difficulty === 'easy')).toBe(true)
  })

  it('returns empty array when no matches', () => {
    expect(filterScores(mockScores, 'expert')).toEqual([])
  })
})

describe('sortScoresByScore', () => {
  it('sorts scores descending', () => {
    const result = sortScoresByScore(mockScores)
    expect(result[0].score).toBe(1000)
    expect(result[1].score).toBe(500)
    expect(result[2].score).toBe(300)
    expect(result[3].score).toBe(200)
  })

  it('does not mutate original array', () => {
    const original = [...mockScores]
    sortScoresByScore(mockScores)
    expect(mockScores).toEqual(original)
  })
})

describe('sortScoresByDate', () => {
  it('sorts by date descending (newest first)', () => {
    const result = sortScoresByDate(mockScores)
    expect(result[0].id).toBe('4') // Jan 4
    expect(result[3].id).toBe('1') // Jan 1
  })

  it('does not mutate original array', () => {
    const original = [...mockScores]
    sortScoresByDate(mockScores)
    expect(mockScores).toEqual(original)
  })
})

describe('limitScores', () => {
  it('limits to specified count', () => {
    expect(limitScores(mockScores, 2)).toHaveLength(2)
  })

  it('returns all if limit exceeds length', () => {
    expect(limitScores(mockScores, 10)).toHaveLength(4)
  })

  it('returns empty for 0 limit', () => {
    expect(limitScores(mockScores, 0)).toEqual([])
  })
})

describe('aggregateStats', () => {
  it('calculates totalGames', () => {
    expect(aggregateStats(mockScores).totalGames).toBe(4)
  })

  it('calculates totalScore', () => {
    expect(aggregateStats(mockScores).totalScore).toBe(2000)
  })

  it('calculates averageScore', () => {
    expect(aggregateStats(mockScores).averageScore).toBe(500)
  })

  it('returns 0 average for empty scores', () => {
    expect(aggregateStats([]).averageScore).toBe(0)
  })

  it('finds best score by difficulty', () => {
    const stats = aggregateStats(mockScores)
    expect(stats.bestScoreByDifficulty.easy?.score).toBe(300)
    expect(stats.bestScoreByDifficulty.medium?.score).toBe(500)
    expect(stats.bestScoreByDifficulty.hard?.score).toBe(1000)
    expect(stats.bestScoreByDifficulty.beginner).toBe(null)
    expect(stats.bestScoreByDifficulty.expert).toBe(null)
  })

  it('returns recent scores sorted by date', () => {
    const stats = aggregateStats(mockScores)
    expect(stats.recentScores[0].id).toBe('4')
    expect(stats.recentScores[3].id).toBe('1')
  })

  it('limits recentScores to 10', () => {
    const manyScores = Array.from({ length: 15 }, (_, i) => ({
      id: String(i),
      difficulty: 'easy' as const,
      score: i * 100,
      timeSeconds: 300,
      hintsUsed: 0,
      mistakes: 0,
      completedAt: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
      userId: 'u1',
    }))
    expect(aggregateStats(manyScores).recentScores).toHaveLength(10)
  })
})
