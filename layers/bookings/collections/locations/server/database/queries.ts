// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { BookingsLocation, NewBookingsLocation } from '../../types'
import { users } from '~~/server/database/schema'
import { teamMembers } from '~~/server/database/schema'

export async function getAllBookingsLocations(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  const locations = await db
    .select({
      ...tables.bookingsLocations,
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
    .from(tables.bookingsLocations)
    .leftJoin(ownerUsers, eq(tables.bookingsLocations.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.bookingsLocations.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsLocations.updatedBy, updatedByUsers.id))
    .where(eq(tables.bookingsLocations.teamId, teamId))
    .orderBy(desc(tables.bookingsLocations.createdAt))

  // Post-query processing for array references
  if (locations.length > 0) {
    // Post-process array references to teamMembers
    const allTeammembersIds = new Set()
    locations.forEach(item => {
        if (item.allowedMemberIds) {
          try {
            const ids = typeof item.allowedMemberIds === 'string'
              ? JSON.parse(item.allowedMemberIds)
              : item.allowedMemberIds
            if (Array.isArray(ids)) {
              ids.forEach(id => allTeammembersIds.add(id))
            }
          } catch (e) {
            // Handle parsing errors gracefully
            console.error('Error parsing allowedMemberIds:', e)
          }
        }
      })

    if (allTeammembersIds.size > 0) {
      const relatedTeammembers = await db
        .select()
        .from(teamMembers)
        .where(inArray(teamMembers.id, Array.from(allTeammembersIds)))

      locations.forEach(item => {
        item.allowedMemberIdsData = []
        if (item.allowedMemberIds) {
          try {
            const ids = typeof item.allowedMemberIds === 'string'
              ? JSON.parse(item.allowedMemberIds)
              : item.allowedMemberIds
            if (Array.isArray(ids)) {
              item.allowedMemberIdsData = relatedTeammembers.filter(r => ids.includes(r.id))
            }
          } catch (e) {
            console.error('Error mapping allowedMemberIds:', e)
          }
        }
      })
    }
  }

  return locations
}

export async function getBookingsLocationsByIds(teamId: string, locationIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  const locations = await db
    .select({
      ...tables.bookingsLocations,
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
    .from(tables.bookingsLocations)
    .leftJoin(ownerUsers, eq(tables.bookingsLocations.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.bookingsLocations.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.bookingsLocations.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.bookingsLocations.teamId, teamId),
        inArray(tables.bookingsLocations.id, locationIds)
      )
    )
    .orderBy(desc(tables.bookingsLocations.createdAt))

  // Post-query processing for array references
  if (locations.length > 0) {
    // Post-process array references to teamMembers
    const allTeammembersIds = new Set()
    locations.forEach(item => {
        if (item.allowedMemberIds) {
          try {
            const ids = typeof item.allowedMemberIds === 'string'
              ? JSON.parse(item.allowedMemberIds)
              : item.allowedMemberIds
            if (Array.isArray(ids)) {
              ids.forEach(id => allTeammembersIds.add(id))
            }
          } catch (e) {
            // Handle parsing errors gracefully
            console.error('Error parsing allowedMemberIds:', e)
          }
        }
      })

    if (allTeammembersIds.size > 0) {
      const relatedTeammembers = await db
        .select()
        .from(teamMembers)
        .where(inArray(teamMembers.id, Array.from(allTeammembersIds)))

      locations.forEach(item => {
        item.allowedMemberIdsData = []
        if (item.allowedMemberIds) {
          try {
            const ids = typeof item.allowedMemberIds === 'string'
              ? JSON.parse(item.allowedMemberIds)
              : item.allowedMemberIds
            if (Array.isArray(ids)) {
              item.allowedMemberIdsData = relatedTeammembers.filter(r => ids.includes(r.id))
            }
          } catch (e) {
            console.error('Error mapping allowedMemberIds:', e)
          }
        }
      })
    }
  }

  return locations
}

export async function createBookingsLocation(data: NewBookingsLocation) {
  const db = useDB()

  const [location] = await db
    .insert(tables.bookingsLocations)
    .values(data)
    .returning()

  return location
}

export async function updateBookingsLocation(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<BookingsLocation>
) {
  const db = useDB()

  const [location] = await db
    .update(tables.bookingsLocations)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.bookingsLocations.id, recordId),
        eq(tables.bookingsLocations.teamId, teamId),
        eq(tables.bookingsLocations.owner, ownerId)
      )
    )
    .returning()

  if (!location) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsLocation not found or unauthorized'
    })
  }

  return location
}

export async function deleteBookingsLocation(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.bookingsLocations)
    .where(
      and(
        eq(tables.bookingsLocations.id, recordId),
        eq(tables.bookingsLocations.teamId, teamId),
        eq(tables.bookingsLocations.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsLocation not found or unauthorized'
    })
  }

  return { success: true }
}