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
  path: string
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
const getPageLink = (page: MenuPage) => {
  if (props.isAppPreview) {
    // App preview route uses explicit /app/{teamSlug}/pages/{slug} pattern
    return `/app/${props.teamSlug}/pages/${page.slug}`
  }
  // For public pages (both custom and main domain), use buildUrl() with full path
  return teamContext.buildUrl(page.path)
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
    return getPageLink(firstPage)
  }

  // Fallback to index if no pages
  if (props.isAppPreview) {
    return `/app/${props.teamSlug}/pages`
  }
  return teamContext.buildUrl('/')
})

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

      <!-- Right: Login button (only when not logged in, island handles logged-in state) -->
      <UButton
        v-if="!loggedIn"
        to="/login"
        variant="outline"
        color="neutral"
        size="sm"
      >
        <UIcon name="i-lucide-log-in" class="w-4 h-4" />
        Login
      </UButton>
    </div>
  </header>
</template>
