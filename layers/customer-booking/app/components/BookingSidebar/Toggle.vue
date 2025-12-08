<script setup lang="ts">
const { isOpen, cartCount } = useBookingCart()

function toggleSidebar() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <UButton
    icon="i-lucide-shopping-cart"
    color="neutral"
    variant="ghost"
    class="relative"
    @click="toggleSidebar"
  >
    <!-- Badge for cart count -->
    <span
      v-if="cartCount > 0"
      class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full"
    >
      {{ cartCount > 9 ? '9+' : cartCount }}
    </span>
  </UButton>
</template>
