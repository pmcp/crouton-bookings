<script setup lang="ts">
import BookingsEmailTemplatesList from '~~/layers/bookings/collections/emailtemplates/app/components/List.vue'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()
</script>

<template>
  <AppContainer :title="t('navigation.emailTemplates')">
    <BookingsEmailTemplatesList />
  </AppContainer>
</template>