import { z } from 'zod';

export const difficultySchema = z.enum([
    'beginner',
    'easy',
    'medium',
    'hard',
    'expert',
]);
export type Difficulty = z.infer<typeof difficultySchema>;

const cellValueSchema = z.number().int().min(0).max(9);
const gridSchema = z.array(z.array(cellValueSchema)).length(9);

export const createUserSchema = z.object({
    username: z.string().regex(/^[a-zA-Z0-9_-]{3,20}$/),
    visitorId: z.string().uuid(),
});

export const submitScoreSchema = z.object({
    difficulty: difficultySchema,
    score: z.number().int().positive(),
    timeSeconds: z.number().int().nonnegative(),
    hintsUsed: z.number().int().nonnegative(),
    mistakes: z.number().int().nonnegative(),
    visitorId: z.string().uuid(),
    username: z.string().min(1),
});

export const saveGameSchema = z.object({
    difficulty: difficultySchema,
    puzzle: gridSchema,
    solution: gridSchema,
    board: z
        .array(
            z.array(
                z.object({
                    value: cellValueSchema,
                    isGiven: z.boolean(),
                    notes: z.array(z.number().int().min(1).max(9)),
                }),
            ),
        )
        .length(9),
    timer: z.number().int().nonnegative(),
    hintsUsed: z.number().int().nonnegative(),
    mistakes: z.number().int().nonnegative(),
    pointsLost: z.number().int().nonnegative(),
    history: z.array(
        z.object({
            type: z.enum(['fill', 'note', 'erase']),
            row: z.number().int().min(0).max(8),
            col: z.number().int().min(0).max(8),
            prevValue: cellValueSchema,
            prevNotes: z.array(z.number().int().min(1).max(9)),
        }),
    ),
});
