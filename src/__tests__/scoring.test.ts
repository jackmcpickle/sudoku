import { describe, it, expect } from 'vitest';
import { calculateScore, formatTime } from '@/lib/scoring';
import type { ScoreFactors } from '@/lib/scoring';

describe('calculateScore', () => {
    it('returns 0 for incomplete games', () => {
        const factors: ScoreFactors = {
            difficulty: 'medium',
            timeSeconds: 300,
            hintsUsed: 0,
            pointsLost: 0,
            completed: false,
        };
        const result = calculateScore(factors);
        expect(result.totalScore).toBe(0);
        expect(result.baseScore).toBe(0);
    });

    describe('completed games', () => {
        it('calculates base score from difficulty', () => {
            const result = calculateScore({
                difficulty: 'beginner',
                timeSeconds: 1000, // beyond time bonus
                hintsUsed: 0,
                pointsLost: 0,
                completed: true,
            });
            expect(result.baseScore).toBe(100);
            expect(result.difficultyMultiplier).toBe(1.0);
        });

        it('applies time bonus when under threshold', () => {
            const result = calculateScore({
                difficulty: 'medium',
                timeSeconds: 0, // instant completion
                hintsUsed: 0,
                pointsLost: 0,
                completed: true,
            });
            // medium: base 500, threshold 900, multiplier 1.5
            // timeBonus = floor(500 * 0.5 * 1) = 250
            expect(result.timeBonus).toBe(250);
            expect(result.totalScore).toBe(Math.floor((500 + 250) * 1.5));
        });

        it('no time bonus when over threshold', () => {
            const result = calculateScore({
                difficulty: 'medium',
                timeSeconds: 1000,
                hintsUsed: 0,
                pointsLost: 0,
                completed: true,
            });
            expect(result.timeBonus).toBe(0);
        });

        it('applies hint penalty', () => {
            const result = calculateScore({
                difficulty: 'medium',
                timeSeconds: 1000,
                hintsUsed: 2,
                pointsLost: 0,
                completed: true,
            });
            // medium hintPenalty: 15, multiplier: 1.5
            // penalty = floor(2 * 15 * 1.5) = 45
            expect(result.hintPenalty).toBe(45);
        });

        it('applies pointsLost', () => {
            const result = calculateScore({
                difficulty: 'medium',
                timeSeconds: 1000,
                hintsUsed: 0,
                pointsLost: 100,
                completed: true,
            });
            expect(result.pointsLost).toBe(100);
            expect(result.totalScore).toBe(Math.floor((500 - 100) * 1.5));
        });

        it('never returns negative score', () => {
            const result = calculateScore({
                difficulty: 'beginner',
                timeSeconds: 1000,
                hintsUsed: 100,
                pointsLost: 1000,
                completed: true,
            });
            expect(result.totalScore).toBe(0);
        });

        it('expert has higher multiplier', () => {
            const result = calculateScore({
                difficulty: 'expert',
                timeSeconds: 1000,
                hintsUsed: 0,
                pointsLost: 0,
                completed: true,
            });
            expect(result.difficultyMultiplier).toBe(3.0);
            expect(result.baseScore).toBe(2000);
        });
    });
});

describe('formatTime', () => {
    it('formats 0 seconds', () => {
        expect(formatTime(0)).toBe('00:00');
    });

    it('formats seconds only', () => {
        expect(formatTime(45)).toBe('00:45');
    });

    it('formats minutes and seconds', () => {
        expect(formatTime(125)).toBe('02:05');
    });

    it('formats single digit seconds with padding', () => {
        expect(formatTime(61)).toBe('01:01');
    });

    it('formats hours as minutes', () => {
        expect(formatTime(3661)).toBe('61:01');
    });
});
