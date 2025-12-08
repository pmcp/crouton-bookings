<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <AppContainer title="Book">
    <CustomerBookingWizard />
  </AppContainer>
</template>
