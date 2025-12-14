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

function toggleCart() {
  isCartOpen.value = !isCartOpen.value
}
</script>

<template>
  <UCard class="h-full flex flex-col relative" :ui="{ body: 'flex-1 flex flex-col min-h-0 p-0' }">
    <!-- Main content area with tabs -->
    <UTabs
      v-model="activeTab"
      :items="tabItems"
      class="flex-1 flex flex-col min-h-0 w-full"
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

    <!-- Cart trigger button (always visible at bottom) -->
    <div class="border-t border-default p-2">
      <UButton
        block
        variant="soft"
        color="neutral"
        class="justify-between"
        @click="toggleCart"
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
            :name="isCartOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
            class="w-4 h-4 transition-transform"
          />
        </span>
      </UButton>
    </div>

    <!-- Cart panel (slides up from bottom using USlideover) -->
    <USlideover
      v-model:open="isCartOpen"
      side="bottom"
      :overlay="false"
      :modal="false"
      title="Cart"
      :ui="{
        content: 'max-h-[70vh] rounded-t-lg',
        body: 'p-0',
      }"
    >
      <template #title>
        <span class="flex items-center gap-2">
          <UIcon name="i-lucide-shopping-cart" class="w-4 h-4" />
          Cart
          <UBadge v-if="cartCount > 0" color="primary" size="xs">
            {{ cartCount }}
          </UBadge>
        </span>
      </template>

      <template #body>
        <BookingSidebarCart />
      </template>
    </USlideover>
  </UCard>
</template>
