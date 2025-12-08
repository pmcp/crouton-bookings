// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { BookingsAsset, NewBookingsAsset } from '../../types'
import { users } from '~~/server/database/schema'

export async function getAllBookingsAssets(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  const assets = await db
    .select({
      ...tables.bookingsAssets,
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
    .from(tables.bookingsAssets)
    .leftJoin(ownerUsers, eq(tables.bookingsAssets.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.bookingsAssets.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsAssets.updatedBy, updatedByUsers.id))
    .where(eq(tables.bookingsAssets.teamId, teamId))
    .orderBy(desc(tables.bookingsAssets.createdAt))

  return assets
}

export async function getBookingsAssetsByIds(teamId: string, assetIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  const assets = await db
    .select({
      ...tables.bookingsAssets,
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
    .from(tables.bookingsAssets)
    .leftJoin(ownerUsers, eq(tables.bookingsAssets.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.bookingsAssets.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsAssets.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.bookingsAssets.teamId, teamId),
        inArray(tables.bookingsAssets.id, assetIds)
      )
    )
    .orderBy(desc(tables.bookingsAssets.createdAt))

  return assets
}

export async function createBookingsAsset(data: NewBookingsAsset) {
  const db = useDB()

  const [asset] = await db
    .insert(tables.bookingsAssets)
    .values(data)
    .returning()

  return asset
}

export async function updateBookingsAsset(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<BookingsAsset>
) {
  const db = useDB()

  const [asset] = await db
    .update(tables.bookingsAssets)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.bookingsAssets.id, recordId),
        eq(tables.bookingsAssets.teamId, teamId),
        eq(tables.bookingsAssets.owner, ownerId)
      )
    )
    .returning()

  if (!asset) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsAsset not found or unauthorized'
    })
  }

  return asset
}

export async function deleteBookingsAsset(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.bookingsAssets)
    .where(
      and(
        eq(tables.bookingsAssets.id, recordId),
        eq(tables.bookingsAssets.teamId, teamId),
        eq(tables.bookingsAssets.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsAsset not found or unauthorized'
    })
  }

  return { success: true }
}