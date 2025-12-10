<script setup lang="ts">
interface Props {
  teamSlug: string
  basePath?: 'p' | 'app'
}

interface MenuPage {
  id: string
  title: string
  slug: string
  order: number | null
  parentId: string | null
  depth: number
}

const props = withDefaults(defineProps<Props>(), {
  basePath: 'p',
})

// Check if user is logged in
const { loggedIn } = useUserSession()

// Fetch menu pages to get the first root page
const { data: pages } = await useFetch<MenuPage[]>(
  () => `/api/public/pages/${props.teamSlug}/menu`
)

// Get the first root page (by order) for the Home link
const homeLink = computed(() => {
  if (!pages.value || pages.value.length === 0) {
    // Fallback to index if no pages
    return props.basePath === 'app'
      ? `/app/${props.teamSlug}/pages`
      : `/p/${props.teamSlug}`
  }

  // Find root pages (no parent) and sort by order
  const rootPages = pages.value
    .filter(p => !p.parentId)
    .sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER
      return orderA - orderB
    })

  const firstPage = rootPages[0]
  if (!firstPage) {
    return props.basePath === 'app'
      ? `/app/${props.teamSlug}/pages`
      : `/p/${props.teamSlug}`
  }

  return props.basePath === 'app'
    ? `/app/${props.teamSlug}/pages/${firstPage.slug}`
    : `/p/${props.teamSlug}/${firstPage.slug}`
})

// Bookings link for logged-in users
const bookingsLink = computed(() => `/app/${props.teamSlug}/bookings`)
</script>

<template>
  <header class="border-b border-neutral-200 dark:border-neutral-800 px-4 py-4">
    <div class="max-w-6xl mx-auto flex items-center">
      <!-- Home link (left) -->
      <NuxtLink
        :to="homeLink"
        class="font-semibold text-neutral-900 dark:text-white"
      >
        Home
      </NuxtLink>

      <!-- Navigation (center) -->
      <div class="flex-1 flex justify-center">
        <PagesNav :team-slug="teamSlug" :base-path="basePath" />
      </div>

      <!-- Bookings link for logged-in users (right) -->
      <div class="w-auto">
        <NuxtLink
          v-if="loggedIn"
          :to="bookingsLink"
          class="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
        >
          My Bookings
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
