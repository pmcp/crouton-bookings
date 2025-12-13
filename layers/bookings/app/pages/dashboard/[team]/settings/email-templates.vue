<script setup lang="ts">
import BookingsEmailTemplatesList from '~~/layers/bookings/collections/emailtemplates/app/components/List.vue'

definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <AppContainer title="Email Templates">
    <BookingsEmailTemplatesList />
  </AppContainer>
</template>