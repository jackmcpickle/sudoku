import type { Difficulty, GameScore } from '@/types';

export function filterScores(
    scores: GameScore[],
    difficulty?: Difficulty,
): GameScore[] {
    if (!difficulty) return scores;
    return scores.filter((s) => s.difficulty === difficulty);
}

export function sortScoresByScore(scores: GameScore[]): GameScore[] {
    return [...scores].sort((a, b) => b.score - a.score);
}

export function sortScoresByDate(scores: GameScore[]): GameScore[] {
    return [...scores].sort(
        (a, b) =>
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime(),
    );
}

export function limitScores(scores: GameScore[], limit: number): GameScore[] {
    return scores.slice(0, limit);
}

export interface UserStats {
    totalGames: number;
    totalScore: number;
    averageScore: number;
    bestScoreByDifficulty: Record<Difficulty, GameScore | null>;
    recentScores: GameScore[];
}

const DIFFICULTIES: Difficulty[] = [
    'beginner',
    'easy',
    'medium',
    'hard',
    'expert',
];

export function aggregateStats(scores: GameScore[]): UserStats {
    const totalGames = scores.length;
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const averageScore =
        totalGames > 0 ? Math.floor(totalScore / totalGames) : 0;

    const bestScoreByDifficulty = DIFFICULTIES.reduce(
        (acc, d) => {
            const diffScores = scores.filter((s) => s.difficulty === d);
            acc[d] =
                diffScores.length > 0
                    ? diffScores.reduce((best, s) =>
                          s.score > best.score ? s : best,
                      )
                    : null;
            return acc;
        },
        {} as Record<Difficulty, GameScore | null>,
    );

    const recentScores = sortScoresByDate(scores).slice(0, 10);

    return {
        totalGames,
        totalScore,
        averageScore,
        bestScoreByDifficulty,
        recentScores,
    };
}
