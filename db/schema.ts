import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  createdAt: text('created_at').notNull(),
})

export const scores = sqliteTable('scores', {
  id: text('id').primaryKey(),
  visitorId: text('visitor_id').notNull().references(() => users.id),
  username: text('username').notNull(),
  difficulty: text('difficulty').notNull(),
  score: integer('score').notNull(),
  timeSeconds: integer('time_seconds').notNull(),
  hintsUsed: integer('hints_used').notNull(),
  mistakes: integer('mistakes').notNull(),
  completedAt: text('completed_at').notNull(),
}, (table) => [
  index('idx_scores_difficulty').on(table.difficulty, table.score),
  index('idx_scores_global').on(table.score),
  index('idx_scores_user').on(table.visitorId),
])

export const games = sqliteTable('games', {
  id: text('id').primaryKey(),
  visitorId: text('visitor_id').notNull().unique().references(() => users.id),
  difficulty: text('difficulty').notNull(),
  puzzle: text('puzzle').notNull(),
  solution: text('solution').notNull(),
  board: text('board').notNull(),
  timer: integer('timer').notNull(),
  hintsUsed: integer('hints_used').notNull(),
  mistakes: integer('mistakes').notNull(),
  pointsLost: integer('points_lost').notNull(),
  history: text('history').notNull(),
  updatedAt: text('updated_at').notNull(),
})
