<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

interface Props {
  teamSlug?: string
}

const props = defineProps<Props>()

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

// Show island when logged in
const showIsland = computed(() => {
  return loggedIn.value
})

function toggleBookingSidebar() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-x-4 scale-95"
    enter-to-class="opacity-100 translate-x-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-x-0 scale-100"
    leave-to-class="opacity-0 translate-x-4 scale-95"
  >
    <div
      v-if="showIsland"
      class="fixed top-4 right-4 z-50 flex flex-col bg-elevated shadow-2xl transition-all duration-300"
      :class="isOpen ? 'rounded-xl' : 'rounded-xl'"
      style="width: 384px;"
    >
      <!-- Island Header (always visible) -->
      <div class="w-full">
        <div class="flex items-center justify-between p-2 gap-2">
          <!-- Left: Admin Settings Link (conditional) -->
          <div class="flex items-center gap-1">
            <UButton
              v-if="isAdmin"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-settings"
              to="/dashboard"
            />
          </div>

          <!-- Right: Language, Account, Book button -->
          <div class="flex items-center gap-1">
            <!-- Language Switcher -->
            <UDropdownMenu
              :items="localeItems"
              :content="{ align: 'center', side: 'bottom', sideOffset: 8 }"
              :ui="{ content: 'min-w-24' }"
            >
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-globe"
                :label="locale.toUpperCase()"
              />
            </UDropdownMenu>

            <!-- Account Menu -->
            <UDropdownMenu
              :items="accountItems"
              :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
              :ui="{ content: 'w-48' }"
            >
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-user"
              />
            </UDropdownMenu>

            <!-- Book Button -->
            <UButton
              color="primary"
              size="sm"
              :icon="isOpen ? 'i-lucide-chevron-up' : 'i-lucide-calendar-plus'"
              :label="isOpen ? 'Close' : 'Book'"
              @click="toggleBookingSidebar"
            >
              <template v-if="cartCount > 0 && !isOpen" #trailing>
                <UBadge
                  color="white"
                  variant="solid"
                  size="xs"
                >
                  {{ cartCount > 9 ? '9+' : cartCount }}
                </UBadge>
              </template>
            </UButton>
          </div>
        </div>
      </div>

      <!-- Sidebar Content (slides down when open) -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out origin-top"
        enter-from-class="opacity-0 scale-y-95"
        enter-to-class="opacity-100 scale-y-100"
        leave-active-class="transition-all duration-150 ease-in origin-top"
        leave-from-class="opacity-100 scale-y-100"
        leave-to-class="opacity-0 scale-y-0"
      >
        <div
          v-if="isOpen"
          class="w-full overflow-hidden flex flex-col border-t border-default"
          style="height: calc(100vh - 5rem);"
        >
          <BookingSidebarSM class="flex-1 min-h-0" />
        </div>
      </Transition>
    </div>
  </Transition>
</template>
