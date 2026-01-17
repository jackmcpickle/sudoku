import { defineConfig } from 'drizzle-kit';

// eslint-disable-next-line import/no-default-export -- Drizzle config requires default export
export default defineConfig({
    schema: './db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
});
