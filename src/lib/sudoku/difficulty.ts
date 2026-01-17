import type { Difficulty, DifficultyConfig } from '@/types'

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  beginner: {
    clueCount: { min: 45, max: 50 },
    baseScore: 100,
    timeBonusThreshold: 300,
    hintPenalty: 5,
    mistakePenalty: 5,
    difficultyMultiplier: 1.0,
    maxHints: 10,
  },
  easy: {
    clueCount: { min: 36, max: 44 },
    baseScore: 250,
    timeBonusThreshold: 600,
    hintPenalty: 10,
    mistakePenalty: 10,
    difficultyMultiplier: 1.2,
    maxHints: 7,
  },
  medium: {
    clueCount: { min: 32, max: 35 },
    baseScore: 500,
    timeBonusThreshold: 900,
    hintPenalty: 15,
    mistakePenalty: 15,
    difficultyMultiplier: 1.5,
    maxHints: 5,
  },
  hard: {
    clueCount: { min: 28, max: 31 },
    baseScore: 1000,
    timeBonusThreshold: 1200,
    hintPenalty: 25,
    mistakePenalty: 25,
    difficultyMultiplier: 2.0,
    maxHints: 3,
  },
  expert: {
    clueCount: { min: 22, max: 27 },
    baseScore: 2000,
    timeBonusThreshold: 1800,
    hintPenalty: 50,
    mistakePenalty: 50,
    difficultyMultiplier: 3.0,
    maxHints: 1,
  },
}

export const DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert']
