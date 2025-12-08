// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { BookingsBooking, NewBookingsBooking } from '../../types'
import * as locationsSchema from '../../../locations/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllBookingsBookings(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  const bookings = await db
    .select({
      ...tables.bookingsBookings,
      locationData: locationsSchema.bookingsLocations,
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
    .from(tables.bookingsBookings)
    .leftJoin(locationsSchema.bookingsLocations, eq(tables.bookingsBookings.location, locationsSchema.bookingsLocations.id))
    .leftJoin(ownerUsers, eq(tables.bookingsBookings.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.bookingsBookings.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsBookings.updatedBy, updatedByUsers.id))
    .where(eq(tables.bookingsBookings.teamId, teamId))
    .orderBy(desc(tables.bookingsBookings.createdAt))

  return bookings
}

export async function getBookingsBookingsByIds(teamId: string, bookingIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  const bookings = await db
    .select({
      ...tables.bookingsBookings,
      locationData: locationsSchema.bookingsLocations,
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
    .from(tables.bookingsBookings)
    .leftJoin(locationsSchema.bookingsLocations, eq(tables.bookingsBookings.location, locationsSchema.bookingsLocations.id))
    .leftJoin(ownerUsers, eq(tables.bookingsBookings.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.bookingsBookings.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsBookings.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.bookingsBookings.teamId, teamId),
        inArray(tables.bookingsBookings.id, bookingIds)
      )
    )
    .orderBy(desc(tables.bookingsBookings.createdAt))

  return bookings
}

export async function createBookingsBooking(data: NewBookingsBooking) {
  const db = useDB()

  const [booking] = await db
    .insert(tables.bookingsBookings)
    .values(data)
    .returning()

  return booking
}

export async function updateBookingsBooking(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<BookingsBooking>
) {
  const db = useDB()

  const [booking] = await db
    .update(tables.bookingsBookings)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.bookingsBookings.id, recordId),
        eq(tables.bookingsBookings.teamId, teamId),
        eq(tables.bookingsBookings.owner, ownerId)
      )
    )
    .returning()

  if (!booking) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsBooking not found or unauthorized'
    })
  }

  return booking
}

export async function deleteBookingsBooking(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.bookingsBookings)
    .where(
      and(
        eq(tables.bookingsBookings.id, recordId),
        eq(tables.bookingsBookings.teamId, teamId),
        eq(tables.bookingsBookings.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsBooking not found or unauthorized'
    })
  }

  return { success: true }
}