import { eq, desc } from 'drizzle-orm';
import { getDb, schema } from '../../db';
import { submitScoreSchema, difficultySchema } from '../../lib/validation';

interface Env {
    DB: D1Database;
}

const GLOBAL_LIMIT = 100;
const DIFFICULTY_LIMIT = 50;
const USER_LIMIT = 5;

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const db = getDb(env.DB);

    const url = new URL(request.url);
    const difficulty = url.searchParams.get('difficulty');
    const visitorId = url.searchParams.get('visitorId');

    if (visitorId) {
        const userScores = await db
            .select()
            .from(schema.scores)
            .where(eq(schema.scores.visitorId, visitorId))
            .orderBy(desc(schema.scores.score))
            .limit(USER_LIMIT);

        return new Response(JSON.stringify(userScores.map(mapScore)), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (difficulty) {
        const parsed = difficultySchema.safeParse(difficulty);
        if (!parsed.success) {
            return new Response(
                JSON.stringify({ error: 'Invalid difficulty' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        const scores = await db
            .select()
            .from(schema.scores)
            .where(eq(schema.scores.difficulty, parsed.data))
            .orderBy(desc(schema.scores.score))
            .limit(DIFFICULTY_LIMIT);

        return new Response(JSON.stringify(scores.map(mapScore)), {
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const scores = await db
        .select()
        .from(schema.scores)
        .orderBy(desc(schema.scores.score))
        .limit(GLOBAL_LIMIT);

    return new Response(JSON.stringify(scores.map(mapScore)), {
        headers: { 'Content-Type': 'application/json' },
    });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const db = getDb(env.DB);

    try {
        const body = await request.json();
        const result = submitScoreSchema.safeParse(body);

        if (!result.success) {
            return new Response(
                JSON.stringify({ error: result.error.issues[0].message }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        const data = result.data;
        const id = crypto.randomUUID();
        const completedAt = new Date().toISOString();

        await db.insert(schema.scores).values({
            id,
            visitorId: data.visitorId,
            username: data.username,
            difficulty: data.difficulty,
            score: data.score,
            timeSeconds: data.timeSeconds,
            hintsUsed: data.hintsUsed,
            mistakes: data.mistakes,
            completedAt,
        });

        return new Response(
            JSON.stringify({
                id,
                ...data,
                completedAt,
            }),
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

function mapScore(row: typeof schema.scores.$inferSelect) {
    return {
        id: row.id,
        visitorId: row.visitorId,
        username: row.username,
        difficulty: row.difficulty,
        score: row.score,
        timeSeconds: row.timeSeconds,
        hintsUsed: row.hintsUsed,
        mistakes: row.mistakes,
        completedAt: row.completedAt,
    };
}
