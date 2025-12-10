<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

interface Props {
  teamSlug: string
  currentPageId: string
  basePath?: 'p' | 'app'
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
  basePath: 'p',
})

// Fetch all menu pages
const { data: pages } = await useFetch<MenuPage[]>(
  () => `/api/public/pages/${props.teamSlug}/menu`
)

// Generate link based on basePath
const getPageLink = (slug: string) => {
  if (props.basePath === 'app') {
    return `/app/${props.teamSlug}/pages/${slug}`
  }
  return `/p/${props.teamSlug}/${slug}`
}

// Build sidebar navigation showing current page context
// Shows: parent (if any), siblings, and children of current page
const sidebarItems = computed<NavigationMenuItem[][]>(() => {
  if (!pages.value || pages.value.length === 0) return []

  const sorted = [...pages.value].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER
    return orderA - orderB
  })

  const pageMap = new Map<string, MenuPage>()
  sorted.forEach(page => pageMap.set(page.id, page))

  const currentPage = pageMap.get(props.currentPageId)
  if (!currentPage) return []

  const items: NavigationMenuItem[][] = []

  // Get parent page (if exists)
  const parent = currentPage.parentId ? pageMap.get(currentPage.parentId) : null

  // Get siblings (pages with same parent)
  const siblings = sorted.filter(p => p.parentId === currentPage.parentId && p.id !== currentPage.id)

  // Get children of current page
  const children = sorted.filter(p => p.parentId === currentPage.id)

  // Build the navigation structure
  const navGroup: NavigationMenuItem[] = []

  // Add parent as a "back" link if it exists
  if (parent) {
    navGroup.push({
      label: parent.title,
      to: getPageLink(parent.slug),
      icon: 'i-lucide-arrow-left',
    })
  }

  // Add current page (highlighted)
  navGroup.push({
    label: currentPage.title,
    to: getPageLink(currentPage.slug),
    icon: 'i-lucide-file-text',
    active: true,
  })

  // Add children indented under current
  if (children.length > 0) {
    for (const child of children) {
      navGroup.push({
        label: child.title,
        to: getPageLink(child.slug),
        icon: 'i-lucide-file',
      })
    }
  }

  // Add siblings
  if (siblings.length > 0) {
    // Add a separator label
    const siblingGroup: NavigationMenuItem[] = [
      {
        label: 'Related Pages',
        type: 'label',
      },
      ...siblings.map(sibling => ({
        label: sibling.title,
        to: getPageLink(sibling.slug),
        icon: 'i-lucide-file-text',
      })),
    ]
    items.push(navGroup)
    items.push(siblingGroup)
  } else {
    items.push(navGroup)
  }

  return items
})

// Check if sidebar has meaningful content to show
const hasSidebarContent = computed(() => {
  if (!pages.value || pages.value.length === 0) return false
  const currentPage = pages.value.find(p => p.id === props.currentPageId)
  if (!currentPage) return false

  // Show sidebar if current page has parent, children, or siblings
  const hasParent = !!currentPage.parentId
  const hasChildren = pages.value.some(p => p.parentId === currentPage.id)
  const hasSiblings = pages.value.some(p => p.parentId === currentPage.parentId && p.id !== currentPage.id)

  return hasParent || hasChildren || hasSiblings
})
</script>

<template>
  <aside v-if="hasSidebarContent" class="sticky top-4">
    <UNavigationMenu
      :items="sidebarItems"
      orientation="vertical"
      highlight
      class="w-full"
    />
  </aside>
</template>