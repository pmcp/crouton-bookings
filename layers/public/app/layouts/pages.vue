<script setup lang="ts">
const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)

// Auth state
const { loggedIn } = useUserSession()

// Booking sidebar state from composable (for header toggle)
const { isOpen: isBookingSidebarOpen } = useBookingCart()

function toggleBookingSidebar() {
  isBookingSidebarOpen.value = !isBookingSidebarOpen.value
}

// Expose toggle function for header
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
    <BookingDrawer />

  </div>
</template>
