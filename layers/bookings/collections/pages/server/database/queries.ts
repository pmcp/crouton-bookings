// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray, sql, like, ne } from 'drizzle-orm'
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

  // @ts-expect-error Complex select with joins requires type assertion
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
    .orderBy(tables.bookingsPages.order)

  return pages
}

export async function getBookingsPagesByIds(teamId: string, pageIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
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

// Tree hierarchy queries (auto-generated when hierarchy: true)

export async function getTreeDataBookingsPages(teamId: string) {
  const db = useDB()

  const pages = await db
    .select()
    .from(tables.bookingsPages)
    .where(eq(tables.bookingsPages.teamId, teamId))
    .orderBy(tables.bookingsPages.path, tables.bookingsPages.order)

  return pages
}

export async function updatePositionBookingsPage(
  teamId: string,
  id: string,
  newParentId: string | null,
  newOrder: number
) {
  const db = useDB()

  // Get the current item to find its path
  const [current] = await db
    .select()
    .from(tables.bookingsPages)
    .where(
      and(
        eq(tables.bookingsPages.id, id),
        eq(tables.bookingsPages.teamId, teamId)
      )
    )

  if (!current) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BookingsPage not found'
    })
  }

  // Calculate new path and depth
  let newPath: string
  let newDepth: number

  if (newParentId) {
    const [parent] = await db
      .select()
      .from(tables.bookingsPages)
      .where(
        and(
          eq(tables.bookingsPages.id, newParentId),
          eq(tables.bookingsPages.teamId, teamId)
        )
      )

    if (!parent) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Parent BookingsPage not found'
      })
    }

    // Prevent moving item to its own descendant
    if (parent.path.startsWith(current.path)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot move item to its own descendant'
      })
    }

    newPath = `${parent.path}${id}/`
    newDepth = parent.depth + 1
  } else {
    newPath = `/${id}/`
    newDepth = 0
  }

  const oldPath = current.path

  console.log('[updatePosition] BEFORE - Current item:', {
    id,
    oldPath,
    oldParentId: current.parentId,
    oldDepth: current.depth,
    oldOrder: current.order
  })
  console.log('[updatePosition] MOVING TO:', {
    newPath,
    newParentId,
    newDepth,
    newOrder
  })

  // Update the item itself
  const [updated] = await db
    .update(tables.bookingsPages)
    .set({
      parentId: newParentId,
      path: newPath,
      depth: newDepth,
      order: newOrder
    })
    .where(
      and(
        eq(tables.bookingsPages.id, id),
        eq(tables.bookingsPages.teamId, teamId)
      )
    )
    .returning()

  console.log('[updatePosition] Updated result:', updated)

  // Update sibling orders to make room for the moved item
  // Get all siblings (same parentId) and shift their orders
  const siblings = await db
    .select()
    .from(tables.bookingsPages)
    .where(
      and(
        eq(tables.bookingsPages.teamId, teamId),
        newParentId
          ? eq(tables.bookingsPages.parentId, newParentId)
          : sql`${tables.bookingsPages.parentId} IS NULL`
      )
    )
    .orderBy(tables.bookingsPages.order)

  // Reorder siblings: moved item gets newOrder, others shift around it
  const siblingUpdates: { id: string; order: number }[] = []
  let orderCounter = 0

  for (const sibling of siblings) {
    if (sibling.id === id) continue // Skip the moved item, already set

    // If we've reached newOrder, skip it (moved item takes this slot)
    if (orderCounter === newOrder) {
      orderCounter++
    }

    if (sibling.order !== orderCounter) {
      siblingUpdates.push({ id: sibling.id, order: orderCounter })
    }
    orderCounter++
  }

  // Apply sibling order updates
  for (const update of siblingUpdates) {
    await db
      .update(tables.bookingsPages)
      .set({ order: update.order })
      .where(eq(tables.bookingsPages.id, update.id))
  }

  console.log('[updatePosition] Sibling order updates:', siblingUpdates)

  // Update all descendants' paths if the path changed
  if (oldPath !== newPath) {
    // Get all descendants - items whose path starts with the old path
    // Query all items and filter in JS to avoid LIKE escaping issues
    const allItems = await db
      .select()
      .from(tables.bookingsPages)
      .where(eq(tables.bookingsPages.teamId, teamId))

    const descendants = allItems.filter(
      item => item.path.startsWith(oldPath) && item.id !== id
    )

    // Update each descendant's path and depth
    for (const descendant of descendants) {
      const descendantNewPath = descendant.path.replace(oldPath, newPath)
      const depthDiff = newDepth - current.depth

      await db
        .update(tables.bookingsPages)
        .set({
          path: descendantNewPath,
          depth: descendant.depth + depthDiff
        })
        .where(eq(tables.bookingsPages.id, descendant.id))
    }
  }

  return updated
}

export async function reorderSiblingsBookingsPages(
  teamId: string,
  updates: { id: string; order: number }[]
) {
  const db = useDB()

  const results = []

  for (const update of updates) {
    const [updated] = await db
      .update(tables.bookingsPages)
      .set({ order: update.order })
      .where(
        and(
          eq(tables.bookingsPages.id, update.id),
          eq(tables.bookingsPages.teamId, teamId)
        )
      )
      .returning()

    if (updated) {
      results.push(updated)
    }
  }

  return results
}