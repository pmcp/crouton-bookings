<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

interface Props {
  teamSlug: string
  orientation?: 'horizontal' | 'vertical'
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
  orientation: 'horizontal',
})

// Fetch menu pages (public endpoint)
const { data: pages } = await useFetch<MenuPage[]>(
  () => `/api/public/pages/${props.teamSlug}/menu`
)

// Use team context to build URLs (handles both custom and main domain)
const teamContext = useTeamContext()

// Generate link using teamContext.buildUrl()
// - Custom domain: returns {path}
// - Main domain: returns /{teamSlug}{path}
const getPageLink = (page: MenuPage) => {
  // Use full path (already starts with /)
  return teamContext.buildUrl(page.path)
}

// Build 2-level nav: root pages + direct children only
function buildTree(flatPages: MenuPage[]): NavigationMenuItem[] {
  if (!flatPages || flatPages.length === 0) return []

  // Sort by order
  const sorted = [...flatPages].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER
    return orderA - orderB
  })

  // Create a map of page ID to page
  const pageMap = new Map<string, MenuPage>()
  sorted.forEach(page => pageMap.set(page.id, page))

  // Find root pages (no parentId or parent not in the returned list)
  const rootPages = sorted.filter(p => !p.parentId || !pageMap.has(p.parentId))

  // Build navigation items
  const result: NavigationMenuItem[] = []

  for (const root of rootPages) {
    // Get only direct children (not grandchildren)
    const directChildren = sorted.filter(p => p.parentId === root.id)

    const item: NavigationMenuItem = {
      label: root.title,
      to: getPageLink(root),
    }

    if (directChildren.length > 0) {
      item.children = directChildren.map(child => ({
        label: child.title,
        to: getPageLink(child),
      }))
    }

    result.push(item)
  }

  return result
}

// Convert pages to navigation menu items
const navItems = computed<NavigationMenuItem[]>(() => {
  return buildTree(pages.value || [])
})
</script>

<template>
  <UNavigationMenu
    v-if="navItems.length > 0"
    :items="navItems"
    :orientation="orientation"
    color="neutral"
    variant="link"
    content-orientation="vertical"
    :ui="{
      content: 'w-auto min-w-48',
      childList: 'min-w-48',
      childLinkLabel: '',
    }"
  />
</template>
