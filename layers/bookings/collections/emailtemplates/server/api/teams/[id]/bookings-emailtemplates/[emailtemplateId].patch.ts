// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updateBookingsEmailTemplate } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { BookingsEmailTemplate } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { emailtemplateId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<BookingsEmailTemplate>>(event)

  return await updateBookingsEmailTemplate(emailtemplateId, team.id, user.id, {
    name: body.name,
    subject: body.subject,
    body: body.body,
    fromEmail: body.fromEmail,
    triggerType: body.triggerType,
    daysOffset: body.daysOffset,
    locationId: body.locationId
  })
})