<script setup lang="ts">
const { loggedIn } = useUserSession()
const { isOpen } = useBookingCart()

function close() {
  isOpen.value = false
}
</script>

<template>
  <UDrawer
    v-if="loggedIn"
    v-model:open="isOpen"
    direction="right"
    inset
    :modal="false"
    :handle="false"
  >
    <template #body>
      <div class="relative h-full">
        <!-- Close button -->
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          class="absolute top-2 right-2 z-10"
          @click="close"
        />
        <BookingSidebarSM />
      </div>
    </template>
  </UDrawer>
</template>
