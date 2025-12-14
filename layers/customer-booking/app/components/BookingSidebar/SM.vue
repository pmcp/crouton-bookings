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
      class="flex-1 flex flex-col min-h-0"
      :ui="{
        root: 'flex-1 flex flex-col min-h-0',
        content: 'flex-1 overflow-y-auto',
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

    <!-- Cart panel (slides up from bottom) -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="isCartOpen"
        class="absolute inset-x-0 bottom-0 bg-elevated border-t border-default shadow-lg max-h-[70vh] flex flex-col overflow-hidden rounded-b-lg"
      >
        <!-- Cart header with close button -->
        <div class="flex items-center justify-between p-3 border-b border-default shrink-0">
          <h3 class="font-medium text-sm flex items-center gap-2">
            <UIcon name="i-lucide-shopping-cart" class="w-4 h-4" />
            Cart
            <UBadge v-if="cartCount > 0" color="primary" size="xs">
              {{ cartCount }}
            </UBadge>
          </h3>
          <UButton
            variant="ghost"
            color="neutral"
            size="xs"
            icon="i-lucide-chevron-down"
            @click="isCartOpen = false"
          />
        </div>

        <!-- Cart content (scrollable area) -->
        <div class="flex-1 min-h-0 overflow-y-auto">
          <BookingSidebarCart />
        </div>
      </div>
    </Transition>
  </UCard>
</template>
