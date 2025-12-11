this<script setup lang="ts">
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
  parentId: string | null
  path: string
  depth: number
}

interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)
const pageSlug = computed(() => route.params.pageSlug as string)

const { data: page, status, error } = await useFetch<PublicPage>(
  () => `/api/public/pages/${teamSlug.value}/${pageSlug.value}`
)

useSeoMeta({
  title: () => page.value?.metaTitle || page.value?.title || 'Page',
  description: () => page.value?.metaDescription || page.value?.excerpt || '',
})

// Extract TOC links from HTML content
const tocLinks = computed<TocLink[]>(() => {
  if (!page.value?.content) return []

  const headingRegex = /<h([2-4])[^>]*(?:id="([^"]*)")?[^>]*>([^<]*)<\/h[2-4]>/gi
  const links: TocLink[] = []
  let match

  while ((match = headingRegex.exec(page.value.content)) !== null) {
    const depth = parseInt(match[1] || '2')
    const headingText = match[3] || ''
    const id = match[2] || headingText.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    const text = headingText.trim()

    if (text) {
      links.push({ id, text, depth })
    }
  }

  return links
})

// Check if there's meaningful TOC content
const hasToc = computed(() => tocLinks.value.length > 0)
</script>

<template>
  <UPage>
    <!-- Left: Sub-navigation + TOC -->
    <template #left>
      <UPageAside v-if="page">
        <!-- Page sub-navigation -->
        <PagesSidebar
          :team-slug="teamSlug"
          :current-page-id="page.id"
          is-app-preview
        />

        <!-- Table of Contents (if page has headings) -->
        <div v-if="hasToc" class="mt-6">
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
            On this page
          </h3>
          <nav class="space-y-1">
            <a
              v-for="link in tocLinks"
              :key="link.id"
              :href="`#${link.id}`"
              class="block text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              :class="{
                'pl-0': link.depth === 2,
                'pl-3': link.depth === 3,
                'pl-6': link.depth === 4,
              }"
            >
              {{ link.text }}
            </a>
          </nav>
        </div>
      </UPageAside>
    </template>

    <UPageBody>
      <!-- Loading state -->
      <div v-if="status === 'pending'" class="animate-pulse space-y-4">
        <div class="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
        <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
        <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
        <div class="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-4/5" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-12">
        <h1 class="text-3xl font-bold mb-4 text-neutral-900 dark:text-white">Page Not Found</h1>
        <p class="text-neutral-500 dark:text-neutral-400">
          This page doesn't exist or isn't published yet.
        </p>
        <NuxtLink
          :to="`/app/${teamSlug}/pages`"
          class="inline-block mt-6 text-primary-600 dark:text-primary-400 hover:underline"
        >
          &larr; Back to home
        </NuxtLink>
      </div>

      <!-- Page content -->
      <template v-else-if="page">
        <!-- Breadcrumb -->
        <PagesBreadcrumb
          :team-slug="teamSlug"
          :current-page-id="page.id"
          is-app-preview
          class="mb-4"
        />

        <h1 class="text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
          {{ page.title }}
        </h1>
        <div
          class="prose prose-neutral dark:prose-invert max-w-none"
          v-html="page.content"
        />
      </template>
    </UPageBody>
  </UPage>
</template>
