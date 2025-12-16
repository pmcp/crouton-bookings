<template>
  <div>
    <AppSidebarContent class="mt-2">
      <AppSidebarGroup>
        <AppSidebarLink
          to="/dashboard"
          icon="i-lucide-chevron-left"
          :label="t('navigation.dashboard')"
        />
        <AppSidebarLink
          to="/dashboard/account-settings"
          icon="i-lucide-user"
          :label="t('navigation.account')"
        />
        <AppSidebarLink
          to="/dashboard/account-security"
          icon="i-lucide-lock"
          :label="t('navigation.security')"
        />
      </AppSidebarGroup>
    </AppSidebarContent>
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n()
</script>
