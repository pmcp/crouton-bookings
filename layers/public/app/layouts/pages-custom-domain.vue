<script setup lang="ts">
/**
 * Layout for public pages on custom domains.
 * Uses useTeamContext() to get team slug from domain resolution.
 */
const teamContext = useTeamContext()
const teamSlug = computed(() => teamContext.teamSlug.value || '')

// Auth state
const { loggedIn } = useUserSession()

// Booking sidebar state from composable
const { isOpen: isBookingSidebarOpen } = useBookingCart()
</script>

<template>
  <div class="h-screen flex flex-col bg-white dark:bg-neutral-950 overflow-hidden">
    <!-- Header (only when not logged in - logged in users see FloatingIslandNav) -->
    <PagesHeader v-if="!loggedIn" :team-slug="teamSlug" />

    <!-- Content area: horizontal flex for main + sidebar -->
    <div class="flex-1 flex min-h-0">
      <!-- Main content (scrollable) -->
      <main class="flex-1 min-w-0 overflow-y-auto">
        <slot />
      </main>

    </div>

    <!-- Booking drawer (right side) -->
    <UDrawer
      v-if="loggedIn"
      v-model:open="isBookingSidebarOpen"
      direction="right"
      :modal="false"
      :handle="false"
      :ui="{ content: 'w-[420px] max-w-[90vw]' }"
    >
      <template #content>
        <BookingSidebarSM />
      </template>
    </UDrawer>

    <!-- Floating island navigation (visible when logged in) -->
    <FloatingIslandNav :team-slug="teamSlug" />
  </div>
</template>
