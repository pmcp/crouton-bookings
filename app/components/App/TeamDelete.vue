<template>
  <UCard>
    <template #header>
      <h3 class="text-sm font-medium">{{ t('accountSettings.dangerZone.title') }}</h3>
    </template>
    <div class="flex items-start gap-2 md:items-center">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10"
      >
        <UIcon name="i-lucide-trash-2" class="h-5 w-5 text-red-500" />
      </div>
      <div class="flex-1">
        <h4 class="font-medium">{{ t('teams.deleteTeam') }}</h4>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ t('teams.deleteTeamDescription') }}
        </p>
      </div>
      <UModal
        :title="`${t('common.delete')} ${currentTeam?.name}`"
        :description="t('accountSettings.dangerZone.irreversible')"
        close-icon="i-lucide-x"
      >
        <UButton color="error" size="lg">{{ t('teams.deletePermanently') }}</UButton>

        <template #body>
          <UForm
            :schema="formSchema"
            :state="formState"
            class="space-y-4"
            @submit="handleSubmit"
          >
            <UFormField
              :label="t('teams.teamName')"
              name="teamName"
              :help="t('teams.confirmDeleteHelp', { teamName: currentTeam?.name })"
            >
              <UInput
                v-model="formState.teamName"
                :placeholder="t('placeholders.enterTeamName')"
                class="w-full"
              />
            </UFormField>
            <UButton
              color="error"
              size="lg"
              type="submit"
              block
              :loading="loading"
              :disabled="formState.teamName !== currentTeam?.name"
            >
              {{ t('teams.deletePermanently') }}
            </UButton>
          </UForm>
        </template>
      </UModal>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import { z } from 'zod'

const { t } = useI18n()
const toast = useToast()
const { currentTeam, deleteTeam, loading } = useTeam()

const formSchema = z.object({
  teamName: z
    .string()
    .min(1, 'Team name is required')
    .refine((val) => val === currentTeam.value.name, {
      message: 'Team name does not match',
    }),
})

type Schema = z.output<typeof formSchema>

const formState = reactive<Partial<Schema>>({
  teamName: '',
})

async function handleSubmit() {
  try {
    if (!currentTeam.value) return
    await deleteTeam(currentTeam.value.id)
    toast.add({
      title: t('toast.teamDeleted.title'),
      color: 'success',
    })
    window.location.href = '/dashboard'
  } catch (error: any) {
    toast.add({
      title: t('toast.teamFailedToDelete.title'),
      description: error?.data?.message || t('errors.generic'),
      color: 'error',
    })
  }
}
</script>
