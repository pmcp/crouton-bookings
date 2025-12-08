// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { BookingsEmailTemplate, NewBookingsEmailTemplate } from '../../types'
import * as locationsSchema from '../../../locations/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllBookingsEmailTemplates(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  const emailtemplates = await db
    .select({
      ...tables.bookingsEmailtemplates,
      locationIdData: locationsSchema.bookingsLocations,
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
    .from(tables.bookingsEmailtemplates)
    .leftJoin(locationsSchema.bookingsLocations, eq(tables.bookingsEmailtemplates.locationId, locationsSchema.bookingsLocations.id))
    .leftJoin(ownerUsers, eq(tables.bookingsEmailtemplates.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.bookingsEmailtemplates.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsEmailtemplates.updatedBy, updatedByUsers.id))
    .where(eq(tables.bookingsEmailtemplates.teamId, teamId))
    .orderBy(desc(tables.bookingsEmailtemplates.createdAt))

  return emailtemplates
}

export async function getBookingsEmailTemplatesByIds(teamId: string, emailtemplateIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  const emailtemplates = await db
    .select({
      ...tables.bookingsEmailtemplates,
      locationIdData: locationsSchema.bookingsLocations,
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
    .from(tables.bookingsEmailtemplates)
    .leftJoin(locationsSchema.bookingsLocations, eq(tables.bookingsEmailtemplates.locationId, locationsSchema.bookingsLocations.id))
    .leftJoin(ownerUsers, eq(tables.bookingsEmailtemplates.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.bookingsEmailtemplates.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsEmailtemplates.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.bookingsEmailtemplates.teamId, teamId),
        inArray(tables.bookingsEmailtemplates.id, emailtemplateIds)
      )
    )
    .orderBy(desc(tables.bookingsEmailtemplates.createdAt))

  return emailtemplates
}

export async function createBookingsEmailTemplate(data: NewBookingsEmailTemplate) {
  const db = useDB()

  const [emailtemplate] = await db
    .insert(tables.bookingsEmailtemplates)
    .values(data)
    .returning()

  return emailtemplate
}

export async function updateBookingsEmailTemplate(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<BookingsEmailTemplate>
) {
  const db = useDB()

  const [emailtemplate] = await db
    .update(tables.bookingsEmailtemplates)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.bookingsEmailtemplates.id, recordId),
        eq(tables.bookingsEmailtemplates.teamId, teamId),
        eq(tables.bookingsEmailtemplates.owner, ownerId)
      )
    )
    .returning()

  if (!emailtemplate) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsEmailTemplate not found or unauthorized'
    })
  }

  return emailtemplate
}

export async function deleteBookingsEmailTemplate(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.bookingsEmailtemplates)
    .where(
      and(
        eq(tables.bookingsEmailtemplates.id, recordId),
        eq(tables.bookingsEmailtemplates.teamId, teamId),
        eq(tables.bookingsEmailtemplates.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsEmailTemplate not found or unauthorized'
    })
  }

  return { success: true }
}