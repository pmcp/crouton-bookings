export type UserRole = 'visitor' | 'member' | 'admin' | 'super-admin'

export const useUserRole = () => {
  const { loggedIn, user } = useUserSession()
  const { isTeamOwner } = useTeam()

  const role = computed<UserRole>(() => {
    if (!loggedIn.value) return 'visitor'
    if (user.value?.superAdmin) return 'super-admin'
    if (isTeamOwner.value) return 'admin'
    return 'member'
  })

  const isAdmin = computed(() => role.value === 'admin' || role.value === 'super-admin')
  const isMember = computed(() => role.value === 'member')
  const isVisitor = computed(() => role.value === 'visitor')

  return { role, isAdmin, isMember, isVisitor }
}
