<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
</script>

<template>
  <AppContainer :title="t('navigation.locations')">
    <BookingsLocationsList />
  </AppContainer>
</template>
