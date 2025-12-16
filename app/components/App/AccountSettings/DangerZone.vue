<template>
  <div
    class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-950 dark:bg-red-950/20"
  >
    <h3 class="font-medium text-red-950 dark:text-red-50">{{ t('accountSettings.dangerZone.title') }}</h3>
    <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
      {{ t('accountSettings.dangerZone.fullDescription') }}
    </p>
    <UButton
      class="mt-4"
      color="error"
      :label="t('accountSettings.dangerZone.proceed')"
      @click="deleteAccountModal = true"
    />
  </div>
  <UModal
    v-model:open="deleteAccountModal"
    :title="t('accountSettings.dangerZone.deleteAccount')"
    :description="t('accountSettings.dangerZone.description')"
  >
    <template #body>
      <UForm :schema="schema" :state="state" class="mb-4" @submit="onSubmit">
        <UFormField :label="t('accountSettings.dangerZone.confirmationLabel')" name="confirmation">
          <UInput
            v-model="state.confirmation"
            class="w-full"
            size="lg"
            variant="subtle"
          />
        </UFormField>

        <div class="mt-6 flex justify-end gap-2">
          <UButton
            :label="t('accountSettings.dangerZone.cancel')"
            variant="ghost"
            color="neutral"
            :loading="isDeleting"
            @click="deleteAccountModal = false"
          />
          <UButton
            type="submit"
            :label="t('accountSettings.dangerZone.proceed')"
            color="error"
            :loading="isDeleting"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { t } = useI18n()
const { logout } = useAuth()
const deleteAccountModal = ref(false)
const isDeleting = ref(false)
const toast = useToast()

const schema = z.object({
  confirmation: z.string().refine((val) => val === 'delete', {
    message: "Please type 'delete' to confirm",
  }),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  confirmation: undefined,
})

async function onSubmit(_event: FormSubmitEvent<Schema>) {
  try {
    isDeleting.value = true
    await $fetch('/api/me/delete-account', {
      method: 'DELETE',
    })
    toast.add({
      title: t('accountSettings.dangerZone.accountDeleted'),
      description: t('accountSettings.dangerZone.accountDeletedDescription'),
      color: 'success',
    })
    await logout()
    await navigateTo('/')
  } catch {
    toast.add({
      title: t('toast.error.title'),
      description: t('accountSettings.dangerZone.failedToDelete'),
      color: 'error',
    })
  } finally {
    isDeleting.value = false
    deleteAccountModal.value = false
  }
}
</script>
