<template>
  <main class="flex min-h-screen items-center justify-center">
    <UContainer class="w-full py-20">
      <div class="text-center">
        <h1 class="text-2xl font-bold">{{ t('pages.onboard.welcome', { name: user?.name }) }}</h1>
        <p class="mt-2 text-neutral-500">
          {{ t('pages.onboard.description') }}
        </p>
      </div>
      <div class="mx-auto mt-12 max-w-md">
        <AppNewTeamForm @success="onTeamCreated" />
      </div>
      <div class="mt-4 flex justify-center">
        <UButton
          variant="ghost"
          color="neutral"
          size="lg"
          icon="i-lucide-arrow-left"
          :label="t('buttons.signOut')"
          @click="signOut"
        />
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import type { Team } from '@@/types/database'

const { t } = useI18n()
const { user } = useUserSession()
const { logout } = useAuth()

const onTeamCreated = async (team: Team) => {
  await navigateTo(`/dashboard/${team.slug}`)
}

async function signOut() {
  await logout()
  await navigateTo('/')
}
</script>
