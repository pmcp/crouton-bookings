import type { Team } from '@@/types/database'

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { loggedIn, user } = useUserSession()
  const teams = useState<Team[]>('teams', () => [])
  const teamSlug = useState<string>('teamSlug')

  // Is user logged in?
  if (!loggedIn.value) {
    if (teamSlug.value) teamSlug.value = ''
    if (teams.value.length) teams.value = []
    return navigateTo('/auth/login')
  }

  // Get team slug from route parameter
  const currentTeam = teams.value.find(
    (team) => team.slug === (to.params.team as string),
  )

  if (!currentTeam) {
    return navigateTo('/dashboard')
  }

  // Check if user is team owner (computed directly to avoid inject warning)
  const isOwner = currentTeam.ownerId === user.value?.id
  if (!isOwner) {
    return navigateTo('/dashboard')
  }
})
