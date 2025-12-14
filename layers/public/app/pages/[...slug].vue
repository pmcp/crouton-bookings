<script setup lang="ts">
/**
 * Custom domain catch-all page handler.
 * Handles: mybusiness.com/services/pricing
 *
 * Uses useTeamContext() to get team from custom domain resolution.
 * Builds path from slug array and fetches via by-path API.
 */
definePageMeta({
  layout: 'pages-custom-domain',
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
  template: string | null
}

const route = useRoute()
const teamContext = useTeamContext()

// Only render on custom domains - redirect otherwise
if (!teamContext.isCustomDomain.value) {
  // On main domain, this catch-all shouldn't match - redirect to home
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
  })
}

// Build the path from the slug array
const pagePath = computed(() => {
  const slugArray = route.params.slug
  if (!slugArray || (Array.isArray(slugArray) && slugArray.length === 0)) {
    return '/'
  }
  const slugStr = Array.isArray(slugArray) ? slugArray.join('/') : slugArray
  return '/' + slugStr
})

// Get team slug from custom domain context
const teamSlug = computed(() => teamContext.teamSlug.value || '')

// Fetch page data using the by-path API
const { data: page, status, error } = await useFetch<PublicPage>(
  () => `/api/public/pages/by-path`,
  {
    query: {
      teamSlug: teamSlug.value,
      path: pagePath.value,
    },
    watch: [teamSlug, pagePath],
  }
)

// SEO meta
useSeoMeta({
  title: () => page.value?.metaTitle || page.value?.title || 'Page',
  description: () => page.value?.metaDescription || page.value?.excerpt || '',
})

// Computed refs for composable inputs
const pageContent = computed(() => page.value?.content)
const pageTemplate = computed(() => page.value?.template)

// Use shared composable for TOC extraction
const { tocLinks } = useContentToc(pageContent)

// Resolve template component based on page setting
const { template } = usePageTemplate(pageTemplate)

// Build props for the template component
const templateProps = computed(() => ({
  title: page.value?.title,
  content: page.value?.content,
  description: page.value?.excerpt,
}))
</script>

<template>
  <UPage>
    <!-- Left: Sub-navigation + TOC -->
    <template #left>
      <UPageAside v-if="page && teamSlug">
        <PagesSidebar
          :team-slug="teamSlug"
          :current-page-id="page.id"
          :toc-links="tocLinks"
        />
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
          to="/"
          class="inline-block mt-6 text-primary-600 dark:text-primary-400 hover:underline"
        >
          &larr; Back to home
        </NuxtLink>
      </div>

      <!-- Page content -->
      <template v-else-if="page">
        <!-- Breadcrumb -->
        <PagesBreadcrumb
          v-if="teamSlug"
          :team-slug="teamSlug"
          :current-page-id="page.id"
          class="mb-4"
        />

        <!-- Dynamic template rendering -->
        <component :is="template" v-bind="templateProps" />
      </template>
    </UPageBody>
  </UPage>
</template>
