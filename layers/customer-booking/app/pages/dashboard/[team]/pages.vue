<script setup lang="ts">
import BookingsPagesListVue from '~~/layers/bookings/collections/pages/app/components/List.vue'

definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <AppContainer title="Pages (Tree Test)">
    <BookingsPagesListVue layout="tree" />
  </AppContainer>
</template>
