<script setup lang="ts">
interface Props {
  teamSlug: string
  isAppPreview?: boolean
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
  isAppPreview: false,
})

// Check if user is logged in
const { loggedIn } = useUserSession()

// Use team context for URL building
const teamContext = useTeamContext()

// Fetch menu pages to get the first root page
const { data: pages } = await useFetch<MenuPage[]>(
  () => `/api/public/pages/${props.teamSlug}/menu`
)

// Generate link based on context
const getPageLink = (slug: string) => {
  if (props.isAppPreview) {
    // App preview route uses explicit /app/{teamSlug}/pages/{slug} pattern
    return `/app/${props.teamSlug}/pages/${slug}`
  }
  // For public pages (both custom and main domain), use buildUrl()
  return teamContext.buildUrl(`/${slug}`)
}

// Get the first root page (by order) for the Home link
const homeLink = computed(() => {
  // Find root pages (no parent) and sort by order
  const rootPages = (pages.value || [])
    .filter(p => !p.parentId)
    .sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER
      return orderA - orderB
    })

  const firstPage = rootPages[0]

  // If we have a first page, link to it
  if (firstPage) {
    return getPageLink(firstPage.slug)
  }

  // Fallback to index if no pages
  if (props.isAppPreview) {
    return `/app/${props.teamSlug}/pages`
  }
  return teamContext.buildUrl('/')
})

// Function to open booking sidebar (injected from layout)
const openBookingSidebar = inject<() => void>('openBookingSidebar', () => {})
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
        <PagesNav :team-slug="teamSlug" />
      </div>

      <!-- Right: Book Now (logged in) or Login (logged out) -->
      <div class="w-auto">
        <UButton
          v-if="loggedIn"
          color="primary"
          size="sm"
          @click="openBookingSidebar"
        >
          <UIcon name="i-lucide-calendar-plus" class="w-4 h-4" />
          Book Now
        </UButton>
        <UButton
          v-else
          to="/login"
          variant="outline"
          color="neutral"
          size="sm"
        >
          <UIcon name="i-lucide-log-in" class="w-4 h-4" />
          Login
        </UButton>
      </div>
    </div>
  </header>
</template>
