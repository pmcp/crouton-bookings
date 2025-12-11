<script setup lang="ts">
const {
  cart,
  cartCount,
  isSubmitting,
  isCartOpen,
  removeFromCart,
  clearCart,
  submitAll,
  activeTab,
} = useBookingCart()

// Format date for display
function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Handle submit
async function handleSubmit() {
  await submitAll()
}

// Go to booking tab (and close drawer)
function goToBooking() {
  isCartOpen.value = false
  activeTab.value = 'book'
}
</script>

<template>
  <div class="p-4">
    <!-- Empty State -->
    <div v-if="cartCount === 0" class="flex flex-col items-center justify-center text-center py-8">
      <UIcon name="i-lucide-shopping-cart" class="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
      <h3 class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
        Your cart is empty
      </h3>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
        Add bookings to your cart to book multiple slots at once
      </p>
      <UButton
        variant="soft"
        size="sm"
        icon="i-lucide-plus"
        @click="goToBooking"
      >
        Add Booking
      </UButton>
    </div>

    <!-- Cart Items -->
    <template v-else>
      <!-- Header row -->
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {{ cartCount }} {{ cartCount === 1 ? 'booking' : 'bookings' }}
        </h3>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          icon="i-lucide-trash-2"
          @click="clearCart"
        >
          Clear all
        </UButton>
      </div>

      <!-- Items List -->
      <div class="space-y-2 mb-4">
        <div
          v-for="item in cart"
          :key="item.id"
          class="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg flex items-start gap-3"
        >
          <div class="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UIcon name="i-lucide-calendar" class="w-4 h-4 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {{ item.locationTitle }} - {{ item.slotLabel }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              {{ formatDate(item.date) }}
            </p>
          </div>
          <UButton
            variant="ghost"
            color="neutral"
            size="xs"
            icon="i-lucide-x"
            class="shrink-0"
            @click="removeFromCart(item.id)"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <div class="pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <UButton
          block
          :loading="isSubmitting"
          :disabled="isSubmitting"
          icon="i-lucide-check"
          @click="handleSubmit"
        >
          {{ isSubmitting ? 'Booking...' : `Book ${cartCount} ${cartCount === 1 ? 'Slot' : 'Slots'}` }}
        </UButton>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-2">
          All bookings will be submitted together
        </p>
      </div>
    </template>
  </div>
</template>
