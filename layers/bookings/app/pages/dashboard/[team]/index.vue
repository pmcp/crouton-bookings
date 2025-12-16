<script setup lang="ts">
// Home page for team dashboard
const { t } = useI18n()
</script>

<template>
  <AppContainer :title="t('navigation.dashboard')">
    <p class="text-neutral-500">{{ t('pages.dashboard.welcome') }}</p>
  </AppContainer>
</template>
