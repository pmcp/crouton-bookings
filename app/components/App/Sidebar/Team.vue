<template>
  <header>
    <AppTeamDropdown />
  </header>
  <AppSidebarContent class="mt-2">
    <AppSidebarGroup>
      <!-- Main -->
      <AppSidebarLink v-for="link in mainLinks" :key="link.to" v-bind="link" />

      <!-- Bookings Section -->
      <li class="mt-4 px-2 py-1">
        <span class="text-xs font-medium uppercase tracking-wider text-neutral-500">{{ t('navigation.sections.bookings') }}</span>
      </li>
      <AppSidebarLink v-for="link in bookingsLinks" :key="link.to" v-bind="link" />

      <!-- Content Section -->
      <li class="mt-4 px-2 py-1">
        <span class="text-xs font-medium uppercase tracking-wider text-neutral-500">{{ t('navigation.sections.content') }}</span>
      </li>
      <AppSidebarLink v-for="link in contentLinks" :key="link.to" v-bind="link" />

      <!-- Settings Section (team owners only) -->
      <template v-if="isTeamOwner">
        <li class="mt-4 px-2 py-1">
          <span class="text-xs font-medium uppercase tracking-wider text-neutral-500">{{ t('navigation.sections.settings') }}</span>
        </li>
        <AppSidebarLink v-for="link in settingsLinks" :key="link.to" v-bind="link" />
      </template>
    </AppSidebarGroup>
  </AppSidebarContent>
</template>

<script lang="ts" setup>
import { useTeam } from '@/composables/useTeam'

const { t } = useI18n()
const { isTeamOwner, currentTeam } = useTeam()

const teamPath = computed(() => `/dashboard/${currentTeam.value.slug}`)

const mainLinks = computed(() => [
  {
    label: t('navigation.home'),
    icon: 'i-lucide-home',
    to: teamPath.value,
  },
])

const bookingsLinks = computed(() => [
  {
    label: t('navigation.allBookings'),
    icon: 'i-lucide-calendar',
    to: `${teamPath.value}/bookings`,
  },
  {
    label: t('navigation.newBooking'),
    icon: 'i-lucide-calendar-plus',
    to: `${teamPath.value}/bookings/new`,
  },
  {
    label: t('navigation.locations'),
    icon: 'i-lucide-map-pin',
    to: `${teamPath.value}/locations`,
  },
])

const contentLinks = computed(() => [
  {
    label: t('navigation.pages'),
    icon: 'i-lucide-file-text',
    to: `${teamPath.value}/pages`,
  },
  {
    label: t('navigation.assets'),
    icon: 'i-lucide-image',
    to: `${teamPath.value}/assets`,
  },
])

const settingsLinks = computed(() => [
  {
    label: t('navigation.bookingOptions'),
    icon: 'i-lucide-sliders-horizontal',
    to: `${teamPath.value}/crouton/bookingsSettings`,
  },
  {
    label: t('navigation.emailTemplates'),
    icon: 'i-lucide-mail',
    to: `${teamPath.value}/settings/email-templates`,
  },
  {
    label: t('navigation.emailLogs'),
    icon: 'i-lucide-mail-check',
    to: `${teamPath.value}/email-logs`,
  },
  {
    label: t('navigation.translations'),
    icon: 'i-lucide-languages',
    to: `${teamPath.value}/translations`,
  },
  {
    label: t('navigation.workspaceSettings'),
    icon: 'i-lucide-settings',
    to: `${teamPath.value}/settings`,
  },
  {
    label: t('teams.members'),
    icon: 'i-lucide-users',
    to: `${teamPath.value}/settings/members`,
  },
  {
    label: t('navigation.domains'),
    icon: 'i-lucide-globe',
    to: `${teamPath.value}/settings/domains`,
  },
  {
    label: t('navigation.billing'),
    icon: 'i-lucide-credit-card',
    to: `${teamPath.value}/settings/billing`,
  },
])
</script>
