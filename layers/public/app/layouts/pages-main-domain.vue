<script setup lang="ts">
/**
 * Layout for main domain public pages with clean URLs.
 * Used for: crouton.com/{teamSlug}/{pageSlug}
 */
const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)

// Auth state
const { loggedIn } = useUserSession()
</script>

<template>
  <div class="min-h-screen bg-neutral-100 dark:bg-neutral-900">
    <!-- Header (only when not logged in - logged in users see FloatingIslandNav) -->
    <PagesHeader v-if="!loggedIn" :team-slug="teamSlug" class="sticky top-0 z-40 bg-neutral-100 dark:bg-neutral-900" />

    <!-- Main content (full page scroll) -->
    <main class="p-6">
      <slot />
    </main>

    <!-- Booking drawer (right side) -->
    <BookingDrawer />

    <!-- Floating island navigation (visible when logged in) -->
    <FloatingIslandNav :team-slug="teamSlug" />
  </div>
</template>
