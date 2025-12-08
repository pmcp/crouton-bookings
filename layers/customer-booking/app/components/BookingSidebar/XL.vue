<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import type { TabsItem } from '@nuxt/ui'

const {
  formState,
  locations,
  locationsStatus,
  selectedLocation,
  isCartOpen,
  cartCount,
  activeTab,
  upcomingBookingsCount,
} = useBookingCart()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')

// Tab items for Book/My Bookings
// Note: Using static label to avoid SSR hydration mismatch (upcomingBookingsCount uses async data)
const tabItems = computed<TabsItem[]>(() => [
  {
    label: 'Book',
    icon: 'i-lucide-calendar-plus',
    value: 'book',
    slot: 'book',
  },
  {
    label: 'My Bookings',
    icon: 'i-lucide-calendar-check',
    value: 'my-bookings',
    slot: 'my-bookings',
  },
])

// Auto-select first location if none selected
watch(
  () => locations.value,
  (locs) => {
    if (locs && locs.length > 0 && !formState.locationId) {
      formState.locationId = locs[0].id
    }
  },
  { immediate: true },
)

function toggleCart() {
  isCartOpen.value = !isCartOpen.value
}
</script>

<template>
  <div class="flex flex-col h-full bg-white dark:bg-neutral-950">
    <!-- Location Navigation (top) -->
    <div class="border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 bg-white dark:bg-neutral-950">
      <div v-if="locationsStatus === 'pending'" class="flex items-center gap-2">
        <UIcon name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
        <span class="text-sm text-muted">Loading locations...</span>
      </div>
      <BookingSidebarLocationNav
        v-else-if="locations && locations.length > 0"
        v-model="formState.locationId"
        :locations="locations"
      />
      <div v-else class="text-sm text-muted">
        No locations available
      </div>
    </div>

    <!-- Main content area -->
    <div
      class="flex-1 overflow-hidden"
      :class="isMobile ? 'flex flex-col' : 'flex'"
    >
      <!-- Left column: Map + Content (60-70% on desktop) -->
      <div
        class="overflow-y-auto p-4 space-y-4"
        :class="isMobile ? 'flex-none' : 'flex-1 lg:w-[60%] xl:w-[65%]'"
      >
        <!-- Map -->
        <BookingSidebarLocationMap :location="selectedLocation" />

        <!-- Location Content -->
        <BookingSidebarLocationContent :location="selectedLocation" />
      </div>

      <!-- Right column: Booking form (~420px on desktop) -->
      <div
        class="border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col relative overflow-hidden"
        :class="isMobile ? 'flex-1' : 'w-[420px] flex-shrink-0'"
      >
        <!-- Tabs: Book / My Bookings -->
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
            <!-- Hide location dropdown in XL mode since we have nav tabs -->
            <BookingSidebarForm :hide-location-select="true" />
          </template>

          <template #my-bookings>
            <BookingSidebarMyBookings />
          </template>
        </UTabs>

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
              <ClientOnly>
                <UBadge v-if="cartCount > 0" color="primary" size="xs">
                  {{ cartCount }}
                </UBadge>
              </ClientOnly>
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
            class="absolute inset-x-0 bottom-0 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 shadow-lg max-h-[70%] flex flex-col"
          >
            <div class="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 class="font-medium text-sm flex items-center gap-2">
                <UIcon name="i-lucide-shopping-cart" class="w-4 h-4" />
                Cart
                <ClientOnly>
                  <UBadge v-if="cartCount > 0" color="primary" size="xs">
                    {{ cartCount }}
                  </UBadge>
                </ClientOnly>
              </h3>
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                icon="i-lucide-chevron-down"
                @click="isCartOpen = false"
              />
            </div>
            <div class="flex-1 overflow-y-auto">
              <BookingSidebarCart />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
