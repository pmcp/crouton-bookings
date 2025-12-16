<template>
  <ul class="space-y-1">
    <template v-if="isAccountSettings">
      <li v-for="link in accountLinks" :key="link.to">
        <AppSidebarLink v-bind="link" />
      </li>
    </template>
    <template v-else>
      <li v-for="link in teamNavLinks" :key="link.to">
        <AppSidebarLink v-bind="link" />
      </li>
      <USeparator class="my-4" />
      <li class="px-2 py-1">
        <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">{{ t('navigation.sections.bookings') }}</span>
      </li>
      <li v-for="link in bookingsLinks" :key="link.to">
        <AppSidebarLink v-bind="link" />
      </li>
      <USeparator class="my-4" />
      <li v-for="link in teamSettingsLinks" :key="link.to">
        <AppSidebarLink v-bind="link" />
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
const { t } = useI18n()

const props = defineProps<{
  isAccountSettings: boolean
  teamSlug?: string
}>()

const accountLinks = computed(() => [
  {
    label: t('navigation.accountSettings'),
    icon: 'i-lucide-settings',
    to: '/dashboard/account-settings',
  },
])

const teamNavLinks = computed(() => [
  {
    label: t('navigation.home'),
    icon: 'i-lucide-home',
    to: `/dashboard/${props.teamSlug}`,
  },
  {
    label: t('navigation.posts'),
    icon: 'i-lucide-file-text',
    to: `/dashboard/${props.teamSlug}/posts`,
  },
])

const bookingsLinks = computed(() => [
  {
    label: t('navigation.bookNow'),
    icon: 'i-lucide-calendar-plus',
    to: `/dashboard/${props.teamSlug}/bookings/new`,
  },
  {
    label: t('navigation.myBookings'),
    icon: 'i-lucide-calendar-check',
    to: `/dashboard/${props.teamSlug}/bookings`,
  },
])

const teamSettingsLinks = computed(() => [
  {
    label: t('navigation.workspaceSettings'),
    icon: 'i-lucide-settings',
    to: `/dashboard/${props.teamSlug}/settings`,
  },
  {
    label: t('navigation.workspaceMembers'),
    icon: 'i-lucide-users',
    to: `/dashboard/${props.teamSlug}/settings/members`,
  },
  {
    label: t('navigation.domains'),
    icon: 'i-lucide-globe',
    to: `/dashboard/${props.teamSlug}/settings/domains`,
  },
  {
    label: t('navigation.emailTemplates'),
    icon: 'i-lucide-mail',
    to: `/dashboard/${props.teamSlug}/settings/email-templates`,
  },
  {
    label: t('navigation.billing'),
    icon: 'i-lucide-credit-card',
    to: `/dashboard/${props.teamSlug}/settings/billing`,
  },
])
</script>
