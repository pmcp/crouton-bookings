<script setup lang="ts">
interface Props {
  teamSlug: string
  variant?: 'horizontal' | 'vertical'
  basePath?: 'p' | 'app'
}

interface MenuPage {
  id: string
  title: string
  slug: string
  order: number | null
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'horizontal',
  basePath: 'p',
})

// Fetch menu pages (public endpoint)
const { data: pages } = await useFetch<MenuPage[]>(
  () => `/api/public/pages/${props.teamSlug}/menu`
)

// Sort by order field (null values at end)
const menuPages = computed(() => {
  if (!pages.value) return []
  return [...pages.value].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER
    return orderA - orderB
  })
})

// Generate link based on basePath
const getPageLink = (slug: string) => {
  if (props.basePath === 'app') {
    return `/app/${props.teamSlug}/pages/${slug}`
  }
  return `/p/${props.teamSlug}/${slug}`
}
</script>

<template>
  <nav v-if="menuPages.length > 0" :class="variant === 'vertical' ? 'flex flex-col gap-2' : 'flex items-center gap-4'">
    <NuxtLink
      v-for="page in menuPages"
      :key="page.id"
      :to="getPageLink(page.slug)"
      class="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
      active-class="text-primary-600 dark:text-primary-400 font-medium"
    >
      {{ page.title }}
    </NuxtLink>
  </nav>
</template>
