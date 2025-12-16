<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <UFormField :label="$t('fields.name')" name="name" required>
      <UInput v-model="state.name" class="w-full" size="lg" />
    </UFormField>
    <UFormField :label="$t('fields.email')" name="email" required>
      <UInput v-model="state.email" class="w-full" size="lg" />
    </UFormField>
    <UFormField :label="$t('fields.password')" name="password" required>
      <UInput
        ref="passwordInput"
        v-model="state.password"
        :type="copied ? 'text' : 'password'"
        class="w-full"
        size="lg"
        :ui="{ trailing: 'pr-1' }"
      >
        <template #trailing>
          <UTooltip :text="$t('superAdmin.users.form.generatePassword')" :content="{ side: 'right' }">
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-sparkles"
              @click="generatePassword"
            />
          </UTooltip>
        </template>
      </UInput>
    </UFormField>
    <UFormField :label="$t('fields.phoneNumber')" name="phoneNumber">
      <UInput
        v-model="state.phoneNumber"
        class="w-full"
        size="lg"
        :placeholder="$t('placeholders.phoneNumber')"
      />
    </UFormField>
    <UFormField :label="$t('fields.avatar')" name="avatar">
      <AppAvatarUploader
        v-model="state.avatarUrl"
        :avatar-size="'md'"
        @file-selected="handleFileSelected"
      />
    </UFormField>
    <UCheckbox
      v-model="state.emailVerified"
      size="lg"
      :label="$t('messages.autoVerifyUser')"
      :description="$t('superAdmin.users.form.autoVerifyDescription')"
    />
    <UButton :loading="loading" type="submit" :label="$t('buttons.inviteUser')" />
  </UForm>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useClipboard } from '@vueuse/core'
import { FetchError } from 'ofetch'

const { t } = useI18n()
const emit = defineEmits(['user-created'])
const loading = ref(false)
const { copy, copied } = useClipboard({
  copiedDuring: 3000,
})

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  emailVerified: z.boolean().optional(),
  avatarUrl: z.string().optional(),
  phoneNumber: z
    .string()
    .regex(
      /^\+[1-9]\d{1,14}$/,
      'Phone number must be in E.164 format (e.g. +12125551234)',
    )
    .optional(),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: undefined,
  email: undefined,
  phoneNumber: undefined,
  password: undefined,
  emailVerified: false,
  avatarUrl: undefined,
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    let filePath = ''

    if (selectedFile.value) {
      filePath = await uploadAvatar()
    }
    const payload = {
      ...event.data,
      avatarUrl: filePath || state.avatarUrl,
    }
    const response = await $fetch('/api/super-admin/users', {
      method: 'POST',
      body: payload,
    })
    toast.add({
      title: t('toast.userCreated.title'),
      description: state.emailVerified
        ? t('toast.userCreated.description', { name: state.name })
        : t('toast.userCreated.descriptionWithVerification', { name: state.name }),
      color: 'success',
      duration: 5000,
    })

    // Reset form after successful submission
    resetForm()

    // Emit event to notify parent component
    emit('user-created', response)
  } catch (error) {
    const errorMessage = (error instanceof FetchError ? error.data?.message : null) || t('errors.failedToCreateUser')
    toast.add({
      title: t('toast.error.title'),
      description: errorMessage,
      color: 'error',
      duration: 5000,
    })
    console.error(error)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  state.name = undefined
  state.email = undefined
  state.phoneNumber = undefined
  state.password = undefined
  state.emailVerified = false
  state.avatarUrl = undefined
  selectedFile.value = null
}

const passwordInput = ref<HTMLInputElement | null>(null)
async function generatePassword() {
  state.password = Math.random().toString(36).substring(2, 15)
  await copy(state.password)
  toast.add({
    title: t('toast.passwordCopied.title'),
    description: t('toast.passwordCopied.description', { password: state.password }),
    color: 'success',
  })
}
const selectedFile = ref<File | null>(null)
const uploadAvatar = async () => {
  try {
    if (!selectedFile.value) return ''
    const formData = new FormData()
    formData.append('image', selectedFile.value)
    const filePath = await $fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })
    return `/images/${filePath}`
  } catch {
    throw new Error('Failed to upload avatar')
  }
}

const handleFileSelected = (file: File | null) => {
  selectedFile.value = file
  if (!file) {
    state.avatarUrl = ''
  }
}
</script>
