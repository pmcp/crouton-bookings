import { nanoid } from 'nanoid'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { teams } from './teams'
import { relations } from 'drizzle-orm'

export const domains = sqliteTable('domains', {
  id: text('id')
    .primaryKey()
    .$default(() => nanoid()),
  teamId: text('teamId')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  domain: text('domain').notNull().unique(),
  status: text('status').notNull().default('pending'), // 'pending', 'verified', 'failed'
  verificationToken: text('verification_token').notNull(),
  verifiedAt: integer('verified_at', { mode: 'timestamp' }),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$default(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$onUpdate(
    () => new Date(),
  ),
})

export const domainsRelations = relations(domains, ({ one }) => ({
  team: one(teams, {
    fields: [domains.teamId],
    references: [teams.id],
  }),
}))
