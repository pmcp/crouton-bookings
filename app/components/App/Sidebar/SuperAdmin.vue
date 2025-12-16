<template>
  <div>
    <header class="px-2">
      <p class="font-bold">{{ t('navigation.superAdmin') }}</p>
    </header>
    <AppSidebarContent class="mt-2">
      <AppSidebarGroup>
        <AppSidebarLink v-for="link in links" :key="link.to" v-bind="link" />
      </AppSidebarGroup>
    </AppSidebarContent>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()

const links = computed(() => [
  {
    label: t('navigation.backToDashboard'),
    icon: 'i-lucide-chevron-left',
    to: '/dashboard',
  },
  {
    label: t('navigation.users'),
    icon: 'i-lucide-users',
    to: '/dashboard/super-admin',
  },
  {
    label: t('navigation.teams'),
    icon: 'i-lucide-users',
    to: '/dashboard/super-admin/teams',
  },
  {
    label: t('navigation.translations'),
    icon: 'i-lucide-languages',
    to: '/dashboard/super-admin/translations',
  },
  {
    label: t('navigation.stripePlans'),
    icon: 'i-lucide-credit-card',
    to: '/dashboard/super-admin/stripe-plans',
  },
  {
    label: t('navigation.feedbackSubmissions'),
    icon: 'i-lucide-message-circle',
    to: '/dashboard/super-admin/feedback-submissions',
  },
  {
    label: t('navigation.newsletterSubscribers'),
    icon: 'i-lucide-mail',
    to: '/dashboard/super-admin/newsletter-subscribers',
  },
])
</script>
