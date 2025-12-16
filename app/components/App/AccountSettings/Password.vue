<template>
  <UCard>
    <template #header>
      <h3 class="font-medium">{{ t('accountSettings.password.title') }}</h3>
      <p class="mt-1 text-sm text-neutral-500">
        {{ t('accountSettings.password.description') }}
      </p>
    </template>
    <UForm
      :schema="passwordSchema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField :label="t('accountSettings.password.newPassword')" name="password">
        <UInput
          v-model="state.password"
          type="password"
          :placeholder="t('placeholders.enterNewPassword')"
          class="w-full"
          size="lg"
        />
      </UFormField>
      <UButton
        color="neutral"
        :loading="loading"
        :disabled="loading"
        type="submit"
        :label="t('accountSettings.password.updatePassword')"
      />
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { loading, updatePassword, passwordSchema } = useUserAccount()
const state = ref({ password: '' })

const onSubmit = async () => {
  await updatePassword(state.value.password)
  state.value.password = ''
}
</script>
