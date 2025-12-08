// Customer-facing endpoint - returns only bookings created by the current user
import { eq, and, desc } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import { bookingsBookings } from '~~/layers/bookings/collections/bookings/server/database/schema'
import { bookingsLocations } from '~~/layers/bookings/collections/locations/server/database/schema'
import { users } from '~~/server/database/schema'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'

export default defineEventHandler(async (event) => {
  const { team, user } = await resolveTeamAndCheckMembership(event)
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')

  // Get bookings created by this user
  const bookings = await db
    .select({
      id: bookingsBookings.id,
      teamId: bookingsBookings.teamId,
      owner: bookingsBookings.owner,
      location: bookingsBookings.location,
      date: bookingsBookings.date,
      slot: bookingsBookings.slot,
      group: bookingsBookings.group,
      status: bookingsBookings.status,
      createdAt: bookingsBookings.createdAt,
      updatedAt: bookingsBookings.updatedAt,
      createdBy: bookingsBookings.createdBy,
      updatedBy: bookingsBookings.updatedBy,
      locationData: bookingsLocations,
      ownerUser: {
        id: ownerUsers.id,
        name: ownerUsers.name,
        email: ownerUsers.email,
        avatarUrl: ownerUsers.avatarUrl,
      },
      createdByUser: {
        id: createdByUsers.id,
        name: createdByUsers.name,
        email: createdByUsers.email,
        avatarUrl: createdByUsers.avatarUrl,
      },
    })
    .from(bookingsBookings)
    .leftJoin(bookingsLocations, eq(bookingsBookings.location, bookingsLocations.id))
    .leftJoin(ownerUsers, eq(bookingsBookings.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(bookingsBookings.createdBy, createdByUsers.id))
    .where(
      and(
        eq(bookingsBookings.teamId, team.id),
        eq(bookingsBookings.createdBy, user.id),
      ),
    )
    .orderBy(desc(bookingsBookings.date))

  return bookings
})
