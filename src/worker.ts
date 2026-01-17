import * as users from '../functions/api/users';
import * as scores from '../functions/api/scores';
import * as games from '../functions/api/games/[visitorId]';

interface Env {
    SUDOKU_STATE: KVNamespace;
    ASSETS: Fetcher;
}

// eslint-disable-next-line import/no-default-export -- Workers require default export
export default {
    async fetch(
        request: Request,
        env: Env,
        _ctx: ExecutionContext,
    ): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        // API routes
        if (path.startsWith('/api/')) {
            const context = {
                request,
                env,
                params: {} as Record<string, string>,
            };

            // /api/users
            if (path === '/api/users') {
                if (method === 'GET')
                    return users.onRequestGet(
                        context as Parameters<typeof users.onRequestGet>[0],
                    );
                if (method === 'POST')
                    return users.onRequestPost(
                        context as Parameters<typeof users.onRequestPost>[0],
                    );
                return new Response('Method not allowed', { status: 405 });
            }

            // /api/scores
            if (path === '/api/scores') {
                if (method === 'GET')
                    return scores.onRequestGet(
                        context as Parameters<typeof scores.onRequestGet>[0],
                    );
                if (method === 'POST')
                    return scores.onRequestPost(
                        context as Parameters<typeof scores.onRequestPost>[0],
                    );
                return new Response('Method not allowed', { status: 405 });
            }

            // /api/games/:visitorId
            const gamesMatch = path.match(/^\/api\/games\/([^/]+)$/);
            if (gamesMatch) {
                const visitorId = gamesMatch[1];
                const gamesContext = { ...context, params: { visitorId } };
                if (method === 'GET')
                    return games.onRequestGet(
                        gamesContext as Parameters<
                            typeof games.onRequestGet
                        >[0],
                    );
                if (method === 'PUT')
                    return games.onRequestPut(
                        gamesContext as Parameters<
                            typeof games.onRequestPut
                        >[0],
                    );
                if (method === 'DELETE')
                    return games.onRequestDelete(
                        gamesContext as Parameters<
                            typeof games.onRequestDelete
                        >[0],
                    );
                return new Response('Method not allowed', { status: 405 });
            }

            return new Response('Not found', { status: 404 });
        }

        // Serve static assets
        return env.ASSETS.fetch(request);
    },
};
