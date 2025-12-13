<template>
  <main class="fixed inset-0 flex overflow-hidden">
    <AppSidebar v-if="!isOnboardRoute" />
    <div class="w-full min-w-0 flex-1 overflow-y-auto">
      <SuperAdminImpersonationBanner v-if="user?._impersonated" :user="user" />
      <NuxtPage />
    </div>
    <!-- Booking Sidebar - only for customer routes -->
    <BookingSidebarPanel v-if="showBookingSidebar" />
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const { user } = useUserSession()
const route = useRoute()

const isOnboardRoute = computed(() =>
  route.path.startsWith('/dashboard/onboard'),
)

// Show booking sidebar only on customer-facing routes (bookings section)
// Exclude /new route as it uses the XL full-page version
const showBookingSidebar = computed(() => {
  const path = route.path
  // Show on bookings routes but not on admin routes or the /new page (which uses XL mode)
  return path.includes('/bookings') && !path.includes('/admin') && !path.endsWith('/new')
})
</script>
