<template>
  <header
    class="sticky top-0 z-40 flex h-12 items-center gap-2 bg-white px-4 dark:bg-neutral-900"
  >
    <UButton
      icon="i-lucide-panel-left"
      color="neutral"
      variant="ghost"
      class="flex lg:hidden"
      @click="mobileMenu = !mobileMenu"
    />
    <div class="min-w-0 flex-1">
      <h1 class="flex-1 truncate font-bold">{{ title }}</h1>
    </div>
    <slot name="actions" />
    <!-- Booking cart toggle - only on mobile, only on booking routes -->
    <BookingSidebarToggle v-if="showBookingToggle" class="lg:hidden" />
  </header>
  <div :class="{ 'p-4': padding }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
const mobileMenu = useState('mobileMenu')
const route = useRoute()

withDefaults(
  defineProps<{
    title: string
    description?: string
    padding?: boolean
  }>(),
  {
    padding: true,
  },
)

// Show booking toggle on booking routes (not admin)
const showBookingToggle = computed(() => {
  const path = route.path
  return path.includes('/bookings') && !path.includes('/admin')
})
</script>
