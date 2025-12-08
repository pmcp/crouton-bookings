// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updateBookingsPage } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { BookingsPage } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { pageId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<BookingsPage>>(event)

  return await updateBookingsPage(pageId, team.id, user.id, {
    title: body.title,
    slug: body.slug,
    content: body.content,
    excerpt: body.excerpt,
    metaDescription: body.metaDescription,
    metaTitle: body.metaTitle,
    featuredImageId: body.featuredImageId,
    status: body.status,
    publishedAt: body.publishedAt ? new Date(body.publishedAt) : body.publishedAt,
    showInMenu: body.showInMenu,
    order: body.order,
    template: body.template
  })
})