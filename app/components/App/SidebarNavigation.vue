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
        <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Bookings</span>
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
const props = defineProps<{
  isAccountSettings: boolean
  teamSlug?: string
}>()

const accountLinks = [
  {
    label: 'Account Settings',
    icon: 'i-lucide-settings',
    to: '/dashboard/account-settings',
  },
]

const teamNavLinks = computed(() => [
  {
    label: 'Home',
    icon: 'i-lucide-home',
    to: `/dashboard/${props.teamSlug}`,
  },
  {
    label: 'Posts',
    icon: 'i-lucide-file-text',
    to: `/dashboard/${props.teamSlug}/posts`,
  },
])

const bookingsLinks = computed(() => [
  {
    label: 'Book Now',
    icon: 'i-lucide-calendar-plus',
    to: `/dashboard/${props.teamSlug}/bookings/new`,
  },
  {
    label: 'My Bookings',
    icon: 'i-lucide-calendar-check',
    to: `/dashboard/${props.teamSlug}/bookings`,
  },
])

const teamSettingsLinks = computed(() => [
  {
    label: 'Workspace Settings',
    icon: 'i-lucide-settings',
    to: `/dashboard/${props.teamSlug}/settings`,
  },
  {
    label: 'Workspace Members',
    icon: 'i-lucide-users',
    to: `/dashboard/${props.teamSlug}/settings/members`,
  },
  {
    label: 'Email Templates',
    icon: 'i-lucide-mail',
    to: `/dashboard/${props.teamSlug}/settings/email-templates`,
  },
  {
    label: 'Billing',
    icon: 'i-lucide-credit-card',
    to: `/dashboard/${props.teamSlug}/settings/billing`,
  },
])
</script>
