<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const {
  activeTab,
  upcomingBookingsCount,
} = useBookingCart()

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
  <div class="h-full w-full flex flex-col relative overflow-hidden bg-default">
    <!-- Main content area with tabs -->
    <UTabs
      v-model="activeTab"
      :items="tabItems"
      class="flex-1 flex flex-col min-h-0 w-full px-3 pt-2"
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
  </div>
</template>
