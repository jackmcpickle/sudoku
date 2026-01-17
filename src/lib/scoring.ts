import type { Difficulty } from '@/types'
import { DIFFICULTY_CONFIG } from './sudoku/difficulty'

export interface ScoreFactors {
  difficulty: Difficulty
  timeSeconds: number
  hintsUsed: number
  mistakes: number
  completed: boolean
}

export interface ScoreBreakdown {
  baseScore: number
  timeBonus: number
  hintPenalty: number
  mistakePenalty: number
  difficultyMultiplier: number
  totalScore: number
}

export function calculateScore(factors: ScoreFactors): ScoreBreakdown {
  if (!factors.completed) {
    return {
      baseScore: 0,
      timeBonus: 0,
      hintPenalty: 0,
      mistakePenalty: 0,
      difficultyMultiplier: 1,
      totalScore: 0,
    }
  }

  const config = DIFFICULTY_CONFIG[factors.difficulty]
  const baseScore = config.baseScore
  const timeRatio = Math.max(0, (config.timeBonusThreshold - factors.timeSeconds) / config.timeBonusThreshold)
  const timeBonus = Math.floor(baseScore * 0.5 * timeRatio)
  const hintPenalty = factors.hintsUsed * config.hintPenalty
  const mistakePenalty = factors.mistakes * config.mistakePenalty
  const difficultyMultiplier = config.difficultyMultiplier
  const rawScore = baseScore + timeBonus - hintPenalty - mistakePenalty
  const totalScore = Math.max(0, Math.floor(rawScore * difficultyMultiplier))

  return {
    baseScore,
    timeBonus,
    hintPenalty,
    mistakePenalty,
    difficultyMultiplier,
    totalScore,
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
