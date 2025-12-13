<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <AppContainer title="Email Logs">
    <BookingsEmailLogsList />
  </AppContainer>
</template>
