<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

interface Props {
  teamSlug: string
  currentPageId: string
  /** Set to true when used in /app/ preview routes (not public pages) */
  isAppPreview?: boolean
  /** Table of contents links extracted from page content */
  tocLinks?: TocLink[]
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

interface TocLink {
  id: string
  text: string
  depth: number
}

const props = withDefaults(defineProps<Props>(), {
  isAppPreview: false,
  tocLinks: () => [],
})

// Fetch all menu pages
const { data: pages } = await useFetch<MenuPage[]>(
  () => `/api/public/pages/${props.teamSlug}/menu`
)

// Use team context to build URLs (handles both custom and main domain)
const teamContext = useTeamContext()

// Generate link using teamContext.buildUrl()
const getPageLink = (page: MenuPage) => {
  if (props.isAppPreview) {
    return `/app/${props.teamSlug}/pages/${page.slug}`
  }
  return teamContext.buildUrl(page.path)
}

// Build navigation menu items from pages
// Root pages are shown in top nav, so sidebar only shows:
// - On root page: children only
// - On child page: back link + siblings + children
const navItems = computed<NavigationMenuItem[][]>(() => {
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

  // Build a map of children for each page
  const childrenMap = new Map<string, MenuPage[]>()
  sorted.forEach(page => {
    if (page.parentId) {
      const children = childrenMap.get(page.parentId) || []
      children.push(page)
      childrenMap.set(page.parentId, children)
    }
  })

  const items: NavigationMenuItem[][] = []
  const isRootPage = !currentPage.parentId

  if (isRootPage) {
    // On a root page: only show children (root siblings are in top nav)
    const children = childrenMap.get(currentPage.id) || []
    if (children.length > 0) {
      const childItems: NavigationMenuItem[] = children.map(child => {
        const grandchildren = childrenMap.get(child.id) || []
        return {
          label: child.title,
          to: getPageLink(child),
          children: grandchildren.length > 0
            ? grandchildren.map(gc => ({
                label: gc.title,
                to: getPageLink(gc),
              }))
            : undefined,
        }
      })
      items.push(childItems)
    }
  } else {
    // On a child page: show back link, siblings, and their children
    const parent = pageMap.get(currentPage.parentId!)

    // Back link to parent
    if (parent) {
      items.push([
        {
          label: parent.title,
          icon: 'i-lucide-arrow-left',
          to: getPageLink(parent),
        },
      ])
    }

    // Siblings (pages with same parent)
    const siblings = sorted.filter(p => p.parentId === currentPage.parentId)
    const siblingItems: NavigationMenuItem[] = siblings.map(page => {
      const children = childrenMap.get(page.id) || []
      const isActive = page.id === props.currentPageId

      return {
        label: page.title,
        to: getPageLink(page),
        active: isActive,
        defaultOpen: isActive && children.length > 0,
        children: children.length > 0
          ? children.map(child => ({
              label: child.title,
              to: getPageLink(child),
            }))
          : undefined,
      }
    })

    if (siblingItems.length > 0) {
      items.push(siblingItems)
    }
  }

  return items
})

// TOC items
const tocItems = computed<NavigationMenuItem[][]>(() => {
  if (!props.tocLinks || props.tocLinks.length === 0) return []

  return [
    [
      {
        label: 'On this page',
        type: 'label',
      },
      ...props.tocLinks.map(link => ({
        label: link.text,
        to: `#${link.id}`,
        class: link.depth === 3 ? 'ml-3' : link.depth === 4 ? 'ml-6' : '',
      })),
    ],
  ]
})

// Combined items
const allItems = computed<NavigationMenuItem[][]>(() => {
  return [...navItems.value, ...tocItems.value]
})

// Check if sidebar has meaningful content to show
const hasContent = computed(() => {
  return allItems.value.length > 0
})
</script>

<template>
  <UNavigationMenu
    v-if="hasContent"
    :items="allItems"
    orientation="vertical"
    variant="link"
    highlight
    color="primary"
    class="w-full"
  />
</template>
