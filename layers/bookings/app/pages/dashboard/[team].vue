<template>
  <main class="fixed inset-0 flex overflow-hidden">
    <AppSidebar v-if="!isOnboardRoute" />
    <div class="w-full min-w-0 flex-1 overflow-y-auto">
      <SuperAdminImpersonationBanner v-if="user?._impersonated" :user="user" />
      <NuxtPage />
    </div>
  </main>

  <!-- Floating Island Navigation -->
  <Teleport to="body">
    <FloatingIslandNav />
  </Teleport>

  <!-- Booking Sidebar SM - Slideover -->
  <USlideover
    v-model:open="isOpen"
    side="right"
    :ui="{ content: 'w-full max-w-md' }"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="font-semibold">Bookings</span>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          icon="i-lucide-maximize-2"
          @click="expandSidebar"
        />
      </div>
    </template>
    <template #body>
      <BookingSidebarSM />
    </template>
  </USlideover>

  <!-- Booking Sidebar XL - full screen overlay when expanded -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isExpanded" class="fixed inset-0 z-50 h-screen w-screen">
        <BookingSidebarXL />
      </div>
    </Transition>
  </Teleport>
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

// Booking cart state
const { isOpen, isExpanded } = useBookingCart()

function expandSidebar() {
  isOpen.value = false
  isExpanded.value = true
}
</script>
