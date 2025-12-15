<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const {
  isCartOpen,
  activeTab,
  cartCount,
  upcomingBookingsCount,
  cartPulse,
} = useBookingCart()

// Track pulse animation for cart button
const isPulsing = ref(false)

// Watch for cart additions and trigger pulse
watch(cartPulse, () => {
  isPulsing.value = true
  setTimeout(() => {
    isPulsing.value = false
  }, 600)
})

const tabItems = computed<TabsItem[]>(() => [
  {
    label: 'Book',
    icon: 'i-lucide-calendar-plus',
    value: 'book',
    slot: 'book',
  },
  {
    label: upcomingBookingsCount.value > 0 ? `My Bookings (${upcomingBookingsCount.value})` : 'My Bookings',
    icon: 'i-lucide-calendar-check',
    value: 'my-bookings',
    slot: 'my-bookings',
  },
])

</script>

<template>
  <UCard class="h-full w-full flex flex-col relative overflow-hidden" :ui="{ root: 'bg-transparent shadow-none ring-0', body: 'p-2 sm:p-1 flex-1 flex flex-col min-h-0 overflow-hidden' }">
    <!-- Main content area with tabs -->
    <UTabs
      v-model="activeTab"
      :items="tabItems"
      class="flex-1 flex flex-col min-h-0 w-full p-2"
      :ui="{
        root: 'flex-1 flex flex-col min-h-0 w-full',
        content: 'flex-1 overflow-y-auto w-full',
      }"
    >
      <template #book>
        <BookingSidebarForm />
      </template>

      <template #my-bookings>
        <BookingSidebarMyBookings />
      </template>
    </UTabs>

    <!-- Cart section (collapsible at bottom) -->
    <UCollapsible v-model:open="isCartOpen" class="border-t border-default">
      <!-- Cart trigger button -->
      <UButton
        block
        variant="soft"
        color="neutral"
        class="justify-between rounded-none"
      >
        <span class="flex items-center gap-2">
          <UIcon name="i-lucide-shopping-cart" class="w-4 h-4" />
          <span>Cart</span>
        </span>
        <span class="flex items-center gap-2">
          <UBadge
            v-if="cartCount > 0"
            color="primary"
            size="xs"
            class="transition-transform"
            :class="{ 'animate-pulse scale-110': isPulsing }"
          >
            {{ cartCount }}
          </UBadge>
          <UIcon
            name="i-lucide-chevron-up"
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-180': isCartOpen }"
          />
        </span>
      </UButton>

      <!-- Cart content -->
      <template #content>
        <div class="max-h-[50vh] overflow-y-auto">
          <BookingSidebarCart />
        </div>
      </template>
    </UCollapsible>
  </UCard>
</template>
