<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

interface Props {
  teamSlug: string
  currentPageId: string
  basePath?: 'p' | 'app' | 'custom-domain' | 'main-domain'
}

interface MenuPage {
  id: string
  title: string
  slug: string
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

// For custom domain, use the team context to build URLs
const teamContext = useTeamContext()

// Generate link based on basePath
const getPageLink = (slug: string) => {
  if (props.basePath === 'custom-domain') {
    // Custom domain: use path directly (e.g., /services/pricing)
    return teamContext.buildUrl(`/${slug}`)
  }
  if (props.basePath === 'main-domain') {
    // Main domain clean URLs: /{teamSlug}/{slug}
    return `/${props.teamSlug}/${slug}`
  }
  if (props.basePath === 'app') {
    return `/app/${props.teamSlug}/pages/${slug}`
  }
  return `/p/${props.teamSlug}/${slug}`
}

// Build breadcrumb trail from current page up to root
const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  if (!pages.value || pages.value.length === 0) return []

  const pageMap = new Map<string, MenuPage>()
  pages.value.forEach(page => pageMap.set(page.id, page))

  const currentPage = pageMap.get(props.currentPageId)
  if (!currentPage) return []

  // Build path from current page to root
  const trail: MenuPage[] = []
  let page: MenuPage | undefined = currentPage

  while (page) {
    trail.unshift(page)
    page = page.parentId ? pageMap.get(page.parentId) : undefined
  }

  // Convert to breadcrumb items - current page has no link
  const items: BreadcrumbItem[] = trail.map((p, index) => ({
    label: p.title,
    to: index === trail.length - 1 ? undefined : getPageLink(p.slug),
  }))

  return items
})
</script>

<template>
  <UBreadcrumb
    v-if="breadcrumbItems.length > 1"
    :items="breadcrumbItems"
  />
</template>
