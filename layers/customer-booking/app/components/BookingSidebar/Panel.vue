<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import type { TabsItem } from '@nuxt/ui'

const { isOpen, activeTab, cartCount } = useBookingCart()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')

const tabItems: TabsItem[] = [
  {
    label: 'Book',
    icon: 'i-lucide-calendar-plus',
    value: 'book',
    slot: 'book',
  },
  {
    label: 'Cart',
    icon: 'i-lucide-shopping-cart',
    value: 'cart',
    slot: 'cart',
  },
]

// Add badge to cart tab when items exist
const tabItemsWithBadge = computed(() => {
  return tabItems.map((item) => {
    if (item.value === 'cart' && cartCount.value > 0) {
      return { ...item, badge: cartCount.value }
    }
    return item
  })
})
</script>

<template>
  <!-- Desktop: Fixed sidebar -->
  <div
    v-if="!isMobile"
    class="w-80 border-l border-neutral-200 bg-white flex flex-col dark:border-neutral-800 dark:bg-neutral-950"
  >
    <UTabs
      v-model="activeTab"
      :items="tabItemsWithBadge"
      class="flex-1 flex flex-col"
      :ui="{
        root: 'flex-1 flex flex-col',
        content: 'flex-1 overflow-y-auto',
      }"
    >
      <template #book>
        <BookingSidebarForm />
      </template>

      <template #cart>
        <BookingSidebarCart />
      </template>
    </UTabs>
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
      <UTabs
        v-model="activeTab"
        :items="tabItemsWithBadge"
        class="h-full flex flex-col"
        :ui="{
          root: 'h-full flex flex-col',
          content: 'flex-1 overflow-y-auto',
        }"
      >
        <template #book>
          <BookingSidebarForm />
        </template>

        <template #cart>
          <BookingSidebarCart />
        </template>
      </UTabs>
    </template>
  </USlideover>
</template>
