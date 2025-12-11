<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { loggedIn, clear: logout } = useUserSession()
const { isAdmin } = useUserRole()
const router = useRouter()

// Function to open booking sidebar (injected from layout)
const openBookingSidebar = inject<() => void>('openBookingSidebar', () => {})

const handleLogout = async () => {
  await logout()
  router.push('/')
}

const items = computed<DropdownMenuItem[][]>(() => {
  const menuItems: DropdownMenuItem[][] = [
    [
      {
        label: 'My Bookings',
        icon: 'i-lucide-calendar',
        onSelect: () => openBookingSidebar(),
      },
    ],
  ]

  // Add Dashboard link for admins
  if (isAdmin.value) {
    menuItems.push([
      {
        label: 'Go to Dashboard',
        icon: 'i-lucide-layout-dashboard',
        to: '/dashboard',
      },
    ])
  }

  // Logout section
  menuItems.push([
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: handleLogout,
    },
  ])

  return menuItems
})
</script>

<template>
  <UDropdownMenu
    v-if="loggedIn"
    :items="items"
    :ui="{ content: 'w-48' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-user"
      size="sm"
    />
  </UDropdownMenu>
</template>
