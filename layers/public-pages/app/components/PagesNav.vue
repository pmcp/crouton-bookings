<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

interface Props {
  teamSlug: string
  orientation?: 'horizontal' | 'vertical'
  basePath?: 'p' | 'app' | 'custom-domain'
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
  basePath: 'p',
})

// Fetch menu pages (public endpoint)
const { data: pages } = await useFetch<MenuPage[]>(
  () => `/api/public/pages/${props.teamSlug}/menu`
)

// For custom domain, use the team context to build URLs
const teamContext = useTeamContext()

// Generate link based on basePath
const getPageLink = (slug: string) => {
  if (props.basePath === 'custom-domain') {
    // Custom domain: use path directly (e.g., /services/pricing)
    return teamContext.buildUrl(`/${slug}`)
  }
  if (props.basePath === 'app') {
    return `/app/${props.teamSlug}/pages/${slug}`
  }
  return `/p/${props.teamSlug}/${slug}`
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
      to: getPageLink(root.slug),
    }

    if (directChildren.length > 0) {
      item.children = directChildren.map(child => ({
        label: child.title,
        to: getPageLink(child.slug),
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
  />
</template>
