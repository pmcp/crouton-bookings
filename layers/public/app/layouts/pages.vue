<script setup lang="ts">
const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)

// Auth state
const { loggedIn } = useUserSession()

// Booking sidebar state from composable
const { isOpen: isBookingSidebarOpen } = useBookingCart()

function toggleBookingSidebar() {
  isBookingSidebarOpen.value = !isBookingSidebarOpen.value
}

// Expose both the toggle function and state so the header can use them
provide('toggleBookingSidebar', toggleBookingSidebar)
provide('isBookingSidebarOpen', isBookingSidebarOpen)
</script>

<template>
  <div class="min-h-screen bg-neutral-100 dark:bg-neutral-900">
    <!-- Header (sticky at top) -->
    <PagesHeader :team-slug="teamSlug" is-app-preview class="sticky top-0 z-40 bg-neutral-100 dark:bg-neutral-900" />

    <!-- Main content (full page scroll) -->
    <main class="p-6">
      <slot />
    </main>

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

  </div>
</template>
