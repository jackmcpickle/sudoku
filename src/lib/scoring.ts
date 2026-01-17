import type { Difficulty } from '@/types'
import { DIFFICULTY_CONFIG } from './sudoku/difficulty'

export interface ScoreFactors {
  difficulty: Difficulty
  timeSeconds: number
  hintsUsed: number
  pointsLost: number
  completed: boolean
}

export interface ScoreBreakdown {
  baseScore: number
  timeBonus: number
  hintPenalty: number
  pointsLost: number
  difficultyMultiplier: number
  totalScore: number
}

export function calculateScore(factors: ScoreFactors): ScoreBreakdown {
  if (!factors.completed) {
    return {
      baseScore: 0,
      timeBonus: 0,
      hintPenalty: 0,
      pointsLost: 0,
      difficultyMultiplier: 1,
      totalScore: 0,
    }
  }

  const config = DIFFICULTY_CONFIG[factors.difficulty]
  const baseScore = config.baseScore
  const timeRatio = Math.max(0, (config.timeBonusThreshold - factors.timeSeconds) / config.timeBonusThreshold)
  const timeBonus = Math.floor(baseScore * 0.5 * timeRatio)
  const hintPenalty = Math.floor(factors.hintsUsed * config.hintPenalty * config.difficultyMultiplier)
  const difficultyMultiplier = config.difficultyMultiplier
  const rawScore = baseScore + timeBonus - hintPenalty - factors.pointsLost
  const totalScore = Math.max(0, Math.floor(rawScore * difficultyMultiplier))

  return {
    baseScore,
    timeBonus,
    hintPenalty,
    pointsLost: factors.pointsLost,
    difficultyMultiplier,
    totalScore,
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
