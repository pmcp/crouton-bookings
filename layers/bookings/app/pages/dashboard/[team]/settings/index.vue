<template>
  <AppContainer :title="t('teams.teamSettings')">
    <div class="space-y-8">
      <AppTeamSettings />
      <AppTeamDelete />
    </div>
  </AppContainer>
</template>

<script lang="ts" setup>
const { t } = useI18n()
</script>
