<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import type { TabsItem } from '@nuxt/ui'

const route = useRoute()
const teamSlug = computed(() => route.params.teamSlug as string)

// Booking sidebar state
const isSidebarOpen = ref(true)
const { isCartOpen, activeTab, cartCount, upcomingBookingsCount } = useBookingCart()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')

// On mobile, sidebar starts closed
watch(isMobile, (mobile) => {
  if (mobile) {
    isSidebarOpen.value = false
  }
}, { immediate: true })

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

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
    <!-- Header -->
    <PagesHeader :team-slug="teamSlug" base-path="app" />

    <!-- Main content area with optional booking sidebar -->
    <div class="flex-1 flex relative">
      <!-- Page content -->
      <main class="flex-1 min-w-0">
        <slot />
      </main>

      <!-- Floating toggle button (when sidebar is closed) -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <button
          v-if="!isSidebarOpen"
          class="fixed right-4 bottom-4 z-40 flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-full shadow-lg transition-colors"
          @click="toggleSidebar"
        >
          <UIcon name="i-lucide-calendar-plus" class="w-5 h-5" />
          <span class="font-medium">Book</span>
          <UBadge v-if="cartCount > 0" color="neutral" variant="solid" size="xs">
            {{ cartCount }}
          </UBadge>
        </button>
      </Transition>

      <!-- Desktop: Collapsible sidebar -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="w-0 opacity-0"
        enter-to-class="w-[380px] opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="w-[380px] opacity-100"
        leave-to-class="w-0 opacity-0"
      >
        <aside
          v-if="isSidebarOpen && !isMobile"
          class="w-[380px] flex-shrink-0 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col relative overflow-hidden"
        >
          <!-- Close button -->
          <div class="absolute top-2 left-2 z-10">
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-panel-right-close"
              @click="toggleSidebar"
            />
          </div>

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
              <div class="flex-1 overflow-y-auto">
                <BookingSidebarCart />
              </div>
            </div>
          </Transition>
        </aside>
      </Transition>

      <!-- Mobile: Slideover -->
      <USlideover
        v-if="isMobile"
        v-model:open="isSidebarOpen"
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

            <!-- Cart panel -->
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
                <div class="flex-1 overflow-y-auto">
                  <BookingSidebarCart />
                </div>
              </div>
            </Transition>
          </div>
        </template>
      </USlideover>
    </div>
  </div>
</template>
