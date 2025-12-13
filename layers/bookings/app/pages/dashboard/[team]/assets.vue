<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <AppContainer title="Assets">
    <BookingsAssetsList />
  </AppContainer>
</template>
