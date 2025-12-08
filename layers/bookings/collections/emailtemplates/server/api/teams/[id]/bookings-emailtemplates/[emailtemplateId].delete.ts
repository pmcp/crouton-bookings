// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { deleteBookingsEmailTemplate } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'

export default defineEventHandler(async (event) => {
  const { emailtemplateId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  return await deleteBookingsEmailTemplate(emailtemplateId, team.id, user.id)
})