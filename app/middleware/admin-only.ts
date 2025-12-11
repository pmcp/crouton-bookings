export default defineNuxtRouteMiddleware(() => {
  const { isAdmin } = useUserRole()

  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
