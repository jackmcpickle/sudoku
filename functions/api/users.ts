import { eq } from 'drizzle-orm';
import { getDb, schema } from '../../db';
import { createUserSchema } from '../../lib/validation';

interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const db = getDb(env.DB);

    try {
        const body = await request.json();
        const result = createUserSchema.safeParse(body);

        if (!result.success) {
            return new Response(
                JSON.stringify({ error: result.error.issues[0].message }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                },
            );
        }

        const { username, visitorId } = result.data;
        const usernameLower = username.toLowerCase();

        const existingByUsername = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.username, usernameLower))
            .get();

        if (existingByUsername && existingByUsername.id !== visitorId) {
            return new Response(JSON.stringify({ error: 'Username taken' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const existingUser = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, visitorId))
            .get();

        const now = new Date().toISOString();

        await db
            .insert(schema.users)
            .values({
                id: visitorId,
                username: usernameLower,
                createdAt: existingUser?.createdAt || now,
            })
            .onConflictDoUpdate({
                target: schema.users.id,
                set: { username: usernameLower },
            });

        return new Response(
            JSON.stringify({
                username,
                visitorId,
                createdAt: existingUser?.createdAt || now,
            }),
            {
                status: 200,
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const db = getDb(env.DB);

    const url = new URL(request.url);
    const visitorId = url.searchParams.get('visitorId');
    const username = url.searchParams.get('username');

    if (username) {
        const user = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.username, username.toLowerCase()))
            .get();

        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(
            JSON.stringify({
                username: user.username,
                visitorId: user.id,
                createdAt: user.createdAt,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    if (!visitorId) {
        return new Response(
            JSON.stringify({ error: 'Missing visitorId or username' }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, visitorId))
        .get();

    if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(
        JSON.stringify({
            username: user.username,
            visitorId: user.id,
            createdAt: user.createdAt,
        }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        },
    );
};
