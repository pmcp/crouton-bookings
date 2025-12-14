<script setup lang="ts">
const { loggedIn } = useUserSession()
const { isOpen } = useBookingCart()
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
    <template #content>
      <BookingSidebarSM />
    </template>
  </UDrawer>
</template>
