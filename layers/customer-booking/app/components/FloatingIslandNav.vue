<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { loggedIn, clear: logout, user } = useUserSession()
const { isOpen, isExpanded, cartCount } = useBookingCart()
const { isAdmin } = useUserRole()
const router = useRouter()
const { locale, locales, setLocale } = useI18n()

// Locale items for language switcher
const localeItems = computed<DropdownMenuItem[][]>(() => {
  const items = (locales.value as { code: string; name?: string }[]).map(loc => ({
    label: loc.name || loc.code.toUpperCase(),
    icon: locale.value === loc.code ? 'i-lucide-check' : undefined,
    onSelect: () => setLocale(loc.code),
  }))
  return [items]
})

// Account menu items
const accountItems = computed<DropdownMenuItem[][]>(() => {
  const items: DropdownMenuItem[][] = [
    [
      {
        label: user.value?.name || user.value?.email || 'Account',
        type: 'label',
        icon: 'i-lucide-user',
      },
    ],
    [
      {
        label: 'My Bookings',
        icon: 'i-lucide-calendar',
        onSelect: () => {
          isOpen.value = true
        },
      },
      {
        label: 'Account Settings',
        icon: 'i-lucide-settings',
        to: '/dashboard/account',
      },
    ],
    [
      {
        label: 'Logout',
        icon: 'i-lucide-log-out',
        color: 'error',
        onSelect: async () => {
          await logout()
          router.push('/')
        },
      },
    ],
  ]
  return items
})

// Show island when logged in and sidebar is closed
const showIsland = computed(() => {
  return loggedIn.value && !isOpen.value && !isExpanded.value
})

function openBookingSidebar() {
  isOpen.value = true
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
  >
    <div
      v-if="showIsland"
      class="fixed left-1/2 -translate-x-1/2 z-40"
      style="bottom: 24px;"
    >
      <div
        class="flex items-center gap-1 p-1.5 bg-neutral-900/95 backdrop-blur-xl rounded-full shadow-2xl border border-white/10"
      >
        <!-- Admin Settings Link (conditional) -->
        <UButton
          v-if="isAdmin"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-settings"
          to="/dashboard"
          class="rounded-full text-white/80 hover:text-white"
        />

        <!-- Language Switcher -->
        <UDropdownMenu
          :items="localeItems"
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          :ui="{ content: 'min-w-24' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-full text-white/80 hover:text-white"
          >
            <UIcon name="i-lucide-globe" class="size-4 mr-1" />
            {{ locale.toUpperCase() }}
            <UIcon name="i-lucide-chevron-down" class="size-3 ml-0.5 opacity-50" />
          </UButton>
        </UDropdownMenu>

        <!-- Account Menu -->
        <UDropdownMenu
          :items="accountItems"
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          :ui="{ content: 'w-48' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-user"
            class="rounded-full text-white/80 hover:text-white"
          >
            <UIcon name="i-lucide-chevron-down" class="size-3 ml-0.5 opacity-50" />
          </UButton>
        </UDropdownMenu>

        <USeparator orientation="vertical" class="h-6 mx-1" />

        <!-- Book Button (now on the right) -->
        <UButton
          color="primary"
          variant="solid"
          size="sm"
          icon="i-lucide-calendar-plus"
          class="rounded-full"
          @click="openBookingSidebar"
        >
          Book
          <UBadge
            v-if="cartCount > 0"
            color="neutral"
            variant="solid"
            size="xs"
            class="ml-1"
          >
            {{ cartCount > 9 ? '9+' : cartCount }}
          </UBadge>
        </UButton>
      </div>
    </div>
  </Transition>
</template>
