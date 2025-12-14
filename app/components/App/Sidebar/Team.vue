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
        <span class="text-xs font-medium uppercase tracking-wider text-neutral-500">Bookings</span>
      </li>
      <AppSidebarLink v-for="link in bookingsLinks" :key="link.to" v-bind="link" />

      <!-- Content Section -->
      <li class="mt-4 px-2 py-1">
        <span class="text-xs font-medium uppercase tracking-wider text-neutral-500">Content</span>
      </li>
      <AppSidebarLink v-for="link in contentLinks" :key="link.to" v-bind="link" />

      <!-- Settings Section (team owners only) -->
      <template v-if="isTeamOwner">
        <li class="mt-4 px-2 py-1">
          <span class="text-xs font-medium uppercase tracking-wider text-neutral-500">Settings</span>
        </li>
        <AppSidebarLink v-for="link in settingsLinks" :key="link.to" v-bind="link" />
      </template>
    </AppSidebarGroup>
  </AppSidebarContent>
</template>

<script lang="ts" setup>
import { useTeam } from '@/composables/useTeam'

const { isTeamOwner, currentTeam } = useTeam()

const teamPath = computed(() => `/dashboard/${currentTeam.value.slug}`)

const mainLinks = computed(() => [
  {
    label: 'Home',
    icon: 'i-lucide-home',
    to: teamPath.value,
  },
])

const bookingsLinks = computed(() => [
  {
    label: 'All Bookings',
    icon: 'i-lucide-calendar',
    to: `${teamPath.value}/bookings`,
  },
  {
    label: 'New Booking',
    icon: 'i-lucide-calendar-plus',
    to: `${teamPath.value}/bookings/new`,
  },
  {
    label: 'Locations',
    icon: 'i-lucide-map-pin',
    to: `${teamPath.value}/locations`,
  },
])

const contentLinks = computed(() => [
  {
    label: 'Pages',
    icon: 'i-lucide-file-text',
    to: `${teamPath.value}/pages`,
  },
  {
    label: 'Assets',
    icon: 'i-lucide-image',
    to: `${teamPath.value}/assets`,
  },
])

const settingsLinks = computed(() => [
  {
    label: 'Email Templates',
    icon: 'i-lucide-mail',
    to: `${teamPath.value}/settings/email-templates`,
  },
  {
    label: 'Email Logs',
    icon: 'i-lucide-mail-check',
    to: `${teamPath.value}/email-logs`,
  },
  {
    label: 'Translations',
    icon: 'i-lucide-languages',
    to: `${teamPath.value}/translations`,
  },
  {
    label: 'Workspace Settings',
    icon: 'i-lucide-settings',
    to: `${teamPath.value}/settings`,
  },
  {
    label: 'Members',
    icon: 'i-lucide-users',
    to: `${teamPath.value}/settings/members`,
  },
  {
    label: 'Domains',
    icon: 'i-lucide-globe',
    to: `${teamPath.value}/settings/domains`,
  },
  {
    label: 'Billing',
    icon: 'i-lucide-credit-card',
    to: `${teamPath.value}/settings/billing`,
  },
])
</script>
