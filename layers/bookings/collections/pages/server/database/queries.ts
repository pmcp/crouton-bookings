// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { BookingsPage, NewBookingsPage } from '../../types'
import * as assetsSchema from '../../../assets/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllBookingsPages(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  const pages = await db
    .select({
      ...tables.bookingsPages,
      featuredImageIdData: assetsSchema.bookingsAssets,
      ownerUser: {
        id: ownerUsers.id,
        name: ownerUsers.name,
        email: ownerUsers.email,
        avatarUrl: ownerUsers.avatarUrl
      },
      createdByUser: {
        id: createdByUsers.id,
        name: createdByUsers.name,
        email: createdByUsers.email,
        avatarUrl: createdByUsers.avatarUrl
      },
      updatedByUser: {
        id: updatedByUsers.id,
        name: updatedByUsers.name,
        email: updatedByUsers.email,
        avatarUrl: updatedByUsers.avatarUrl
      }
    })
    .from(tables.bookingsPages)
    .leftJoin(assetsSchema.bookingsAssets, eq(tables.bookingsPages.featuredImageId, assetsSchema.bookingsAssets.id))
    .leftJoin(ownerUsers, eq(tables.bookingsPages.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.bookingsPages.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsPages.updatedBy, updatedByUsers.id))
    .where(eq(tables.bookingsPages.teamId, teamId))
    .orderBy(desc(tables.bookingsPages.createdAt))

  return pages
}

export async function getBookingsPagesByIds(teamId: string, pageIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  const pages = await db
    .select({
      ...tables.bookingsPages,
      featuredImageIdData: assetsSchema.bookingsAssets,
      ownerUser: {
        id: ownerUsers.id,
        name: ownerUsers.name,
        email: ownerUsers.email,
        avatarUrl: ownerUsers.avatarUrl
      },
      createdByUser: {
        id: createdByUsers.id,
        name: createdByUsers.name,
        email: createdByUsers.email,
        avatarUrl: createdByUsers.avatarUrl
      },
      updatedByUser: {
        id: updatedByUsers.id,
        name: updatedByUsers.name,
        email: updatedByUsers.email,
        avatarUrl: updatedByUsers.avatarUrl
      }
    })
    .from(tables.bookingsPages)
    .leftJoin(assetsSchema.bookingsAssets, eq(tables.bookingsPages.featuredImageId, assetsSchema.bookingsAssets.id))
    .leftJoin(ownerUsers, eq(tables.bookingsPages.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.bookingsPages.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsPages.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.bookingsPages.teamId, teamId),
        inArray(tables.bookingsPages.id, pageIds)
      )
    )
    .orderBy(desc(tables.bookingsPages.createdAt))

  return pages
}

export async function createBookingsPage(data: NewBookingsPage) {
  const db = useDB()

  const [page] = await db
    .insert(tables.bookingsPages)
    .values(data)
    .returning()

  return page
}

export async function updateBookingsPage(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<BookingsPage>
) {
  const db = useDB()

  const [page] = await db
    .update(tables.bookingsPages)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.bookingsPages.id, recordId),
        eq(tables.bookingsPages.teamId, teamId),
        eq(tables.bookingsPages.owner, ownerId)
      )
    )
    .returning()

  if (!page) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsPage not found or unauthorized'
    })
  }

  return page
}

export async function deleteBookingsPage(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.bookingsPages)
    .where(
      and(
        eq(tables.bookingsPages.id, recordId),
        eq(tables.bookingsPages.teamId, teamId),
        eq(tables.bookingsPages.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsPage not found or unauthorized'
    })
  }

  return { success: true }
}