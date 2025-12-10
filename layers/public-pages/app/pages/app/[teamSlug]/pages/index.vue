<script setup lang="ts">
definePageMeta({
  layout: 'pages',
})

interface PublicPage {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  metaTitle: string | null
  metaDescription: string | null
}

const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)

// Fetch the first published page as homepage
const { data: menuPages } = await useFetch<Array<{ id: string; title: string; slug: string; order: number | null; parentId: string | null }>>(
  () => `/api/public/pages/${teamSlug.value}/menu`
)

// Get the first root page slug to show as homepage
const homePageSlug = computed(() => {
  if (!menuPages.value || menuPages.value.length === 0) return null
  // Filter to root pages only, then sort by order
  const rootPages = menuPages.value
    .filter(p => !p.parentId)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  return rootPages[0]?.slug
})

// Fetch the homepage content
const homePage = ref<PublicPage | null>(null)
const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')

watch(homePageSlug, async (slug) => {
  if (!slug) {
    homePage.value = null
    return
  }
  status.value = 'pending'
  try {
    const data = await $fetch<PublicPage>(`/api/public/pages/${teamSlug.value}/${slug}`)
    homePage.value = data
    status.value = 'success'
  } catch {
    homePage.value = null
    status.value = 'error'
  }
}, { immediate: true })

useSeoMeta({
  title: () => homePage.value?.metaTitle || homePage.value?.title || 'Pages',
  description: () => homePage.value?.metaDescription || homePage.value?.excerpt || '',
})
</script>

<template>
  <!-- Page content -->
  <article class="max-w-4xl mx-auto px-4 py-12">
    <!-- Loading state -->
    <div v-if="status === 'pending'" class="animate-pulse space-y-4">
      <div class="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
      <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
      <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
    </div>

    <!-- No pages yet -->
    <div v-else-if="!homePage" class="text-center py-12">
      <h1 class="text-3xl font-bold mb-4 text-neutral-900 dark:text-white">Welcome</h1>
      <p class="text-neutral-500 dark:text-neutral-400">
        No pages have been published yet.
      </p>
    </div>

    <!-- Homepage content -->
    <div v-else>
      <h1 class="text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
        {{ homePage.title }}
      </h1>
      <div
        class="prose prose-neutral dark:prose-invert max-w-none"
        v-html="homePage.content"
      />
    </div>
  </article>
</template>
