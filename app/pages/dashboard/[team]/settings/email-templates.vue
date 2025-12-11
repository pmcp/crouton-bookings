<script setup lang="ts">
import BookingsEmailTemplatesListVue from '~~/layers/bookings/collections/emailtemplates/app/components/List.vue'

definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <AppContainer title="Email Templates">
    <BookingsEmailTemplatesListVue />
  </AppContainer>
</template>
