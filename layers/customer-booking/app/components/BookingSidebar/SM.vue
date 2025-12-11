<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import type { TabsItem } from '@nuxt/ui'

const {
  isOpen,
  isCartOpen,
  activeTab,
  cartCount,
  upcomingBookingsCount,
  canAddToCart,
  addToCart,
  selectedLocation,
  formState,
  allSlots,
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

// Format date for display in sticky footer
const selectedDateFormatted = computed(() => {
  if (!formState.date) return ''
  return formState.date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
})

// Get slot label for display in sticky footer
const selectedSlotLabel = computed(() => {
  if (!formState.slotId) return ''
  if (formState.slotId === 'all-day') return 'All Day'
  const slot = allSlots.value.find(s => s.id === formState.slotId)
  return slot?.label || slot?.value || formState.slotId
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')

// Track if component is mounted (for hydration safety)
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
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
  <!-- Wait for client-side mount to avoid hydration mismatch with breakpoints -->
  <template v-if="!isMounted">
    <!-- SSR placeholder - render desktop version by default -->
    <div
      :style="{ width: '420px', minWidth: '420px' }"
      class="flex-shrink-0 border-l border-neutral-200 bg-white flex flex-col dark:border-neutral-800 dark:bg-neutral-950 relative overflow-hidden"
    />
  </template>

  <!-- Desktop: Fixed sidebar -->
  <div
    v-else-if="!isMobile"
    :style="{ width: '420px', minWidth: '420px' }"
    class="flex-shrink-0 h-full border-l border-neutral-200 bg-white flex flex-col dark:border-neutral-800 dark:bg-neutral-950 relative overflow-hidden"
  >
    <!-- Main content area -->
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

    <!-- Sticky footer for add to cart (only when selection is ready) -->
    <div
      v-if="canAddToCart && activeTab === 'book'"
      class="border-t border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-950"
    >
      <div class="flex items-center gap-3">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {{ selectedLocation?.title }} - {{ selectedSlotLabel }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ selectedDateFormatted }}
          </p>
        </div>
        <UButton
          icon="i-lucide-plus"
          size="lg"
          color="primary"
          @click="addToCart"
        />
      </div>
    </div>

    <!-- Cart trigger button (always visible at bottom) -->
    <div class="border-t border-neutral-200 dark:border-neutral-800 p-2 bg-white dark:bg-neutral-950">
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

    <!-- Cart panel (slides up from bottom, contained within sidebar) -->
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
        class="absolute inset-x-0 bottom-0 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 shadow-lg max-h-[70vh] flex flex-col overflow-hidden"
      >
        <!-- Cart header with close button -->
        <div class="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
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
  </div>

  <!-- Mobile: Slideover -->
  <USlideover
    v-else
    v-model:open="isOpen"
    side="right"
    :ui="{
      content: 'w-full max-w-sm',
    }"
  >
    <template #body>
      <div class="h-full flex flex-col relative overflow-hidden">
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

        <!-- Sticky footer for add to cart (only when selection is ready) -->
        <div
          v-if="canAddToCart && activeTab === 'book'"
          class="border-t border-neutral-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-950"
        >
          <div class="flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {{ selectedLocation?.title }} - {{ selectedSlotLabel }}
              </p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                {{ selectedDateFormatted }}
              </p>
            </div>
            <UButton
              icon="i-lucide-plus"
              size="lg"
              color="primary"
              @click="addToCart"
            />
          </div>
        </div>

        <!-- Cart trigger button -->
        <div class="border-t border-neutral-200 dark:border-neutral-800 p-2 bg-white dark:bg-neutral-950">
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
            class="absolute inset-x-0 bottom-0 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 shadow-lg max-h-[70vh] flex flex-col overflow-hidden"
          >
            <!-- Cart header with close button -->
            <div class="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
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
      </div>
    </template>
  </USlideover>
</template>
