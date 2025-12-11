// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { BookingsEmailLog, NewBookingsEmailLog } from '../../types'
import * as bookingsSchema from '../../../bookings/server/database/schema'
import * as emailTemplatesSchema from '../../../emailtemplates/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllBookingsEmailLogs(teamId: string) {
  const db = useDB()

  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const emaillogs = await db
    .select({
      ...tables.bookingsEmaillogs,
      bookingIdData: bookingsSchema.bookingsBookings,
      templateIdData: emailTemplatesSchema.bookingsEmailtemplates,
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
    .from(tables.bookingsEmaillogs)
    .leftJoin(bookingsSchema.bookingsBookings, eq(tables.bookingsEmaillogs.bookingId, bookingsSchema.bookingsBookings.id))
    .leftJoin(emailTemplatesSchema.bookingsEmailtemplates, eq(tables.bookingsEmaillogs.templateId, emailTemplatesSchema.bookingsEmailtemplates.id))
    .leftJoin(createdByUsers, eq(tables.bookingsEmaillogs.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsEmaillogs.updatedBy, updatedByUsers.id))
    .where(eq(tables.bookingsEmaillogs.teamId, teamId))
    .orderBy(desc(tables.bookingsEmaillogs.createdAt))

  return emaillogs
}

export async function getBookingsEmailLogsByIds(teamId: string, emaillogIds: string[]) {
  const db = useDB()

  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const emaillogs = await db
    .select({
      ...tables.bookingsEmaillogs,
      bookingIdData: bookingsSchema.bookingsBookings,
      templateIdData: emailTemplatesSchema.bookingsEmailtemplates,
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
    .from(tables.bookingsEmaillogs)
    .leftJoin(bookingsSchema.bookingsBookings, eq(tables.bookingsEmaillogs.bookingId, bookingsSchema.bookingsBookings.id))
    .leftJoin(emailTemplatesSchema.bookingsEmailtemplates, eq(tables.bookingsEmaillogs.templateId, emailTemplatesSchema.bookingsEmailtemplates.id))
    .leftJoin(createdByUsers, eq(tables.bookingsEmaillogs.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsEmaillogs.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.bookingsEmaillogs.teamId, teamId),
        inArray(tables.bookingsEmaillogs.id, emaillogIds)
      )
    )
    .orderBy(desc(tables.bookingsEmaillogs.createdAt))

  return emaillogs
}

export async function createBookingsEmailLog(data: NewBookingsEmailLog) {
  const db = useDB()

  const [emaillog] = await db
    .insert(tables.bookingsEmaillogs)
    .values(data)
    .returning()

  return emaillog
}

export async function updateBookingsEmailLog(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<BookingsEmailLog>
) {
  const db = useDB()

  const [emaillog] = await db
    .update(tables.bookingsEmaillogs)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.bookingsEmaillogs.id, recordId),
        eq(tables.bookingsEmaillogs.teamId, teamId),
        eq(tables.bookingsEmaillogs.owner, ownerId)
      )
    )
    .returning()

  if (!emaillog) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsEmailLog not found or unauthorized'
    })
  }

  return emaillog
}

export async function deleteBookingsEmailLog(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.bookingsEmaillogs)
    .where(
      and(
        eq(tables.bookingsEmaillogs.id, recordId),
        eq(tables.bookingsEmaillogs.teamId, teamId),
        eq(tables.bookingsEmaillogs.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsEmailLog not found or unauthorized'
    })
  }

  return { success: true }
}