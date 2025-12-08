<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import type { TabsItem } from '@nuxt/ui'

const { isOpen, isCartOpen, activeTab, cartCount, upcomingBookingsCount } = useBookingCart()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')

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
  <!-- Desktop: Fixed sidebar -->
  <div
    v-if="!isMobile"
    :style="{ width: '420px', minWidth: '420px' }"
    class="flex-shrink-0 border-l border-neutral-200 bg-white flex flex-col dark:border-neutral-800 dark:bg-neutral-950 relative overflow-hidden"
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
          <UBadge v-if="cartCount > 0" color="primary" size="xs">
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
        class="absolute inset-x-0 bottom-0 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 shadow-lg max-h-[70%] flex flex-col"
      >
        <!-- Cart header with close button -->
        <div class="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800">
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

        <!-- Cart content -->
        <div class="flex-1 overflow-y-auto">
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
    title="Booking"
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
              <UBadge v-if="cartCount > 0" color="primary" size="xs">
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
            class="absolute inset-x-0 bottom-0 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 shadow-lg max-h-[70%] flex flex-col"
          >
            <!-- Cart header with close button -->
            <div class="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800">
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

            <!-- Cart content -->
            <div class="flex-1 overflow-y-auto">
              <BookingSidebarCart />
            </div>
          </div>
        </Transition>
      </div>
    </template>
  </USlideover>
</template>
