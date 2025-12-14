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
    enter-from-class="opacity-0 -translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 -translate-y-4 scale-95"
  >
    <div
      v-if="showIsland"
      class="fixed left-1/2 -translate-x-1/2 z-50"
      style="top: 16px;"
    >
      <div
        class="flex items-center gap-0.5 pl-2 pr-1 py-1 bg-neutral-900/90 backdrop-blur-xl rounded-full shadow-2xl"
      >
        <!-- Admin Settings Link (conditional) -->
        <UButton
          v-if="isAdmin"
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-lucide-settings"
          to="/dashboard"
          class="rounded-full text-white/70 hover:text-white hover:bg-white/10"
        />

        <!-- Navigation Menu (when teamSlug is provided) -->
        <template v-if="teamSlug">
          <div v-if="isAdmin" class="w-px h-4 bg-white/10 mx-1" />
          <PagesNav
            :team-slug="teamSlug"
            class="[&_button]:text-sm [&_button]:text-white/70 [&_button]:hover:text-white [&_button]:px-2.5 [&_button]:py-1"
          />
          <div class="w-px h-4 bg-white/10 mx-1" />
        </template>

        <!-- Language Switcher -->
        <UDropdownMenu
          :items="localeItems"
          :content="{ align: 'center', side: 'bottom', sideOffset: 8 }"
          :ui="{ content: 'min-w-24' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            class="rounded-full text-white/70 hover:text-white hover:bg-white/10 px-2"
          >
            <UIcon name="i-lucide-globe" class="size-3.5" />
            <span class="text-xs font-medium ml-1">{{ locale.toUpperCase() }}</span>
          </UButton>
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
            size="xs"
            icon="i-lucide-user"
            class="rounded-full text-white/70 hover:text-white hover:bg-white/10"
          />
        </UDropdownMenu>

        <!-- Book Button -->
        <button
          class="flex items-center gap-1.5 ml-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-full transition-colors"
          @click="toggleBookingSidebar"
        >
          <UIcon name="i-lucide-calendar-plus" class="size-3.5" />
          <span class="text-xs font-medium">Book</span>
          <span
            v-if="cartCount > 0"
            class="text-[10px] font-medium bg-primary-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
          >
            {{ cartCount > 9 ? '9+' : cartCount }}
          </span>
        </button>
      </div>
    </div>
  </Transition>
</template>
