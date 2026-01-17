import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb(d1: D1Database): ReturnType<typeof drizzle> {
    return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof getDb>;
export { schema };
