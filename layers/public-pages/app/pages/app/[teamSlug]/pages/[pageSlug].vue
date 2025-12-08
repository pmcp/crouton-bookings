<script setup lang="ts">
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
const pageSlug = computed(() => route.params.pageSlug as string)

const { data: page, status, error } = await useFetch<PublicPage>(
  () => `/api/public/pages/${teamSlug.value}/${pageSlug.value}`
)

useSeoMeta({
  title: () => page.value?.metaTitle || page.value?.title || 'Page',
  description: () => page.value?.metaDescription || page.value?.excerpt || '',
})
</script>

<template>
  <main class="min-h-screen bg-white dark:bg-neutral-950">
    <!-- Header with nav -->
    <header class="border-b border-neutral-200 dark:border-neutral-800 px-4 py-4">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <NuxtLink
          :to="`/app/${teamSlug}/pages`"
          class="font-semibold text-neutral-900 dark:text-white"
        >
          Home
        </NuxtLink>
        <PagesNav :team-slug="teamSlug" base-path="app" />
      </div>
    </header>

    <!-- Page content -->
    <article class="max-w-4xl mx-auto px-4 py-12">
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
      <div v-else-if="page">
        <h1 class="text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
          {{ page.title }}
        </h1>
        <div
          class="prose prose-neutral dark:prose-invert max-w-none"
          v-html="page.content"
        />
      </div>
    </article>
  </main>
</template>
