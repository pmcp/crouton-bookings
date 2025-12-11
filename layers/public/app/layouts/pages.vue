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

    <!-- Booking sidebar (fixed, slides in from right) -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="loggedIn && isBookingSidebarOpen"
        class="fixed right-4 z-30 hidden lg:block w-[420px]"
        style="top: calc(57px + 1.5rem); height: calc(100vh - 57px - 3rem);"
      >
        <BookingSidebarSM />
      </aside>
    </Transition>

  </div>
</template>
