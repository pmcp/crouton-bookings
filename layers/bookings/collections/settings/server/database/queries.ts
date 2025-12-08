// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { BookingsSetting, NewBookingsSetting } from '../../types'
import { users } from '~~/server/database/schema'

export async function getAllBookingsSettings(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  const settings = await db
    .select({
      ...tables.bookingsSettings,
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
    .from(tables.bookingsSettings)
    .leftJoin(ownerUsers, eq(tables.bookingsSettings.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.bookingsSettings.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsSettings.updatedBy, updatedByUsers.id))
    .where(eq(tables.bookingsSettings.teamId, teamId))
    .orderBy(desc(tables.bookingsSettings.createdAt))

  return settings
}

export async function getBookingsSettingsByIds(teamId: string, settingIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  const settings = await db
    .select({
      ...tables.bookingsSettings,
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
    .from(tables.bookingsSettings)
    .leftJoin(ownerUsers, eq(tables.bookingsSettings.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.bookingsSettings.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsSettings.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.bookingsSettings.teamId, teamId),
        inArray(tables.bookingsSettings.id, settingIds)
      )
    )
    .orderBy(desc(tables.bookingsSettings.createdAt))

  return settings
}

export async function createBookingsSetting(data: NewBookingsSetting) {
  const db = useDB()

  const [setting] = await db
    .insert(tables.bookingsSettings)
    .values(data)
    .returning()

  return setting
}

export async function updateBookingsSetting(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<BookingsSetting>
) {
  const db = useDB()

  const [setting] = await db
    .update(tables.bookingsSettings)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.bookingsSettings.id, recordId),
        eq(tables.bookingsSettings.teamId, teamId),
        eq(tables.bookingsSettings.owner, ownerId)
      )
    )
    .returning()

  if (!setting) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsSetting not found or unauthorized'
    })
  }

  return setting
}

export async function deleteBookingsSetting(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.bookingsSettings)
    .where(
      and(
        eq(tables.bookingsSettings.id, recordId),
        eq(tables.bookingsSettings.teamId, teamId),
        eq(tables.bookingsSettings.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsSetting not found or unauthorized'
    })
  }

  return { success: true }
}