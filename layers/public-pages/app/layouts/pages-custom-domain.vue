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

function openBookingSidebar() {
  isBookingSidebarOpen.value = true
}

// Expose the function so the header can call it
provide('openBookingSidebar', openBookingSidebar)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
    <!-- Header (full width, stays on top) -->
    <PagesHeader :team-slug="teamSlug" base-path="custom-domain" />

    <!-- Content area: horizontal flex for main + sidebar -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Main content (scrollable) -->
      <main class="flex-1 min-w-0 overflow-y-auto">
        <slot />
      </main>

      <!-- Booking sidebar (right side, logged in only) -->
      <BookingSidebarSM v-if="loggedIn" />
    </div>

    <!-- Floating booking button (visible on mobile when logged in) -->
    <BookingFloatingButton v-if="loggedIn" />
  </div>
</template>
