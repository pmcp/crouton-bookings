<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <AppContainer title="My Bookings">
    <MyBookingsList />
  </AppContainer>
</template>
