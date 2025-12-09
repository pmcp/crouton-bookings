import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real, customType } from 'drizzle-orm/sqlite-core'

// Custom JSON column that handles NULL values gracefully during LEFT JOINs
const jsonColumn = customType<any>({
  dataType() {
    return 'text'
  },
  fromDriver(value: unknown): any {
    if (value === null || value === undefined || value === '') {
      return null
    }
    return JSON.parse(value as string)
  },
  toDriver(value: any): string {
    return JSON.stringify(value)
  },
})

export const bookingsPages = sqliteTable('bookings_pages', {
  id: text('id').primaryKey().$default(() => nanoid()),

  teamId: text('teamId').notNull(),
  owner: text('owner').notNull(),

  // Hierarchy fields for tree structure
  parentId: text('parentId'),
  path: text('path').notNull().$default(() => '/'),
  depth: integer('depth').notNull().$default(() => 0),
  order: integer('order').notNull().$default(() => 0),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  content: text('content'),
  excerpt: text('excerpt'),
  metaDescription: text('metaDescription'),
  metaTitle: text('metaTitle'),
  featuredImageId: text('featuredImageId'),
  status: text('status').notNull(),
  publishedAt: integer('publishedAt', { mode: 'timestamp' }).$default(() => new Date()),
  showInMenu: integer('showInMenu', { mode: 'boolean' }).$default(() => false),
  template: text('template'),

  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date()),
  createdBy: text('createdBy').notNull(),
  updatedBy: text('updatedBy').notNull()
})