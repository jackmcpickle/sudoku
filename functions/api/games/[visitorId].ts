import { eq } from 'drizzle-orm';
import { getDb, schema } from '../../../db';
import { saveGameSchema } from '../../../lib/validation';

interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env, params } = context;
    const db = getDb(env.DB);
    const visitorId = params.visitorId as string;

    const game = await db
        .select()
        .from(schema.games)
        .where(eq(schema.games.visitorId, visitorId))
        .get();

    if (!game) {
        return new Response(JSON.stringify({ error: 'No saved game' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(mapGame(game)), {
        headers: { 'Content-Type': 'application/json' },
    });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const db = getDb(env.DB);
    const visitorId = params.visitorId as string;

    try {
        const body = await request.json();
        const result = saveGameSchema.safeParse(body);

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
        const updatedAt = new Date().toISOString();

        await db
            .insert(schema.games)
            .values({
                id,
                visitorId,
                difficulty: data.difficulty,
                puzzle: JSON.stringify(data.puzzle),
                solution: JSON.stringify(data.solution),
                board: JSON.stringify(data.board),
                timer: data.timer,
                hintsUsed: data.hintsUsed,
                mistakes: data.mistakes,
                pointsLost: data.pointsLost,
                history: JSON.stringify(data.history),
                updatedAt,
            })
            .onConflictDoUpdate({
                target: schema.games.visitorId,
                set: {
                    difficulty: data.difficulty,
                    puzzle: JSON.stringify(data.puzzle),
                    solution: JSON.stringify(data.solution),
                    board: JSON.stringify(data.board),
                    timer: data.timer,
                    hintsUsed: data.hintsUsed,
                    mistakes: data.mistakes,
                    pointsLost: data.pointsLost,
                    history: JSON.stringify(data.history),
                    updatedAt,
                },
            });

        return new Response(
            JSON.stringify({
                id,
                visitorId,
                ...data,
                updatedAt,
            }),
            {
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

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const { env, params } = context;
    const db = getDb(env.DB);
    const visitorId = params.visitorId as string;

    await db.delete(schema.games).where(eq(schema.games.visitorId, visitorId));

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
    });
};

interface MappedGame {
    id: string;
    visitorId: string;
    difficulty: string;
    puzzle: unknown;
    solution: unknown;
    board: unknown;
    timer: number;
    hintsUsed: number;
    mistakes: number;
    pointsLost: number;
    history: unknown;
    updatedAt: string;
}

function mapGame(row: typeof schema.games.$inferSelect): MappedGame {
    return {
        id: row.id,
        visitorId: row.visitorId,
        difficulty: row.difficulty,
        puzzle: JSON.parse(row.puzzle),
        solution: JSON.parse(row.solution),
        board: JSON.parse(row.board),
        timer: row.timer,
        hintsUsed: row.hintsUsed,
        mistakes: row.mistakes,
        pointsLost: row.pointsLost,
        history: JSON.parse(row.history),
        updatedAt: row.updatedAt,
    };
}
