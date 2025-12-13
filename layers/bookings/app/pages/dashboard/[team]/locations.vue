<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <AppContainer title="Locations">
    <BookingsLocationsList />
  </AppContainer>
</template>
