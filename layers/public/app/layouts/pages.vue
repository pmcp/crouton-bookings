<script setup lang="ts">
const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)
</script>

<template>
  <div class="min-h-screen bg-neutral-100 dark:bg-neutral-900">
    <!-- Header (sticky at top) -->
    <PagesHeader :team-slug="teamSlug" is-app-preview class="sticky top-0 z-40 bg-neutral-100 dark:bg-neutral-900" />

    <!-- Main content (full page scroll) -->
    <main class="p-6">
      <slot />
    </main>

    <!-- Combined floating island + sidebar (visible when logged in) -->
    <FloatingIslandSidebar :team-slug="teamSlug" />
  </div>
</template>
