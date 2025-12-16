<template>
  <UCard>
    <template #header>
      <h3 class="font-medium">{{ t('accountSettings.phoneNumber.title') }}</h3>
      <p class="mt-1 text-sm text-neutral-500">
        {{ t('accountSettings.phoneNumber.privacyNotice') }}
      </p>
    </template>

    <div v-if="mode === 'input'" class="max-w-md space-y-4">
      <UFormField
        :label="t('accountSettings.phoneNumber.phoneNumber')"
        :help="t('accountSettings.phoneNumber.help')"
      >
        <UInput
          v-model="phoneNumber"
          :placeholder="t('placeholders.phoneNumber')"
          class="w-full"
          size="lg"
          type="tel"
        />
      </UFormField>
      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          :loading="loading"
          :disabled="loading || !isValidPhoneNumber"
          :label="t('accountSettings.phoneNumber.verify')"
          @click="sendVerificationCode"
        />

        <UButton
          v-if="user?.phoneNumber"
          color="error"
          variant="ghost"
          :loading="loading"
          :disabled="loading"
          :label="t('accountSettings.phoneNumber.remove')"
          @click="removePhoneNumber"
        />
      </div>
    </div>

    <div v-else-if="mode === 'verify'" class="max-w-md space-y-4">
      <p class="text-sm">
        {{ t('accountSettings.phoneNumber.sentCodeTo') }}
        <span class="font-medium">{{ phoneNumber }}</span>
      </p>

      <UFormField :label="t('accountSettings.phoneNumber.verificationCode')">
        <UPinInput
          v-model="otpCode"
          :length="6"
          size="lg"
          otp
          type="number"
          :placeholder="t('placeholders.verificationCode')"
        />
      </UFormField>

      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          :loading="loading"
          :disabled="loading || otpCode.length !== 6"
          :label="t('accountSettings.phoneNumber.verifyButton')"
          @click="verifyCode"
        />

        <UButton
          color="neutral"
          variant="ghost"
          :loading="resendLoading"
          :disabled="resendLoading || resendCountdown > 0"
          @click="sendVerificationCode"
        >
          {{
            resendCountdown > 0 ? t('accountSettings.phoneNumber.resendCountdown', { seconds: resendCountdown }) : t('accountSettings.phoneNumber.resend')
          }}
        </UButton>

        <UButton
          color="neutral"
          variant="ghost"
          :disabled="loading"
          :label="t('accountSettings.phoneNumber.cancel')"
          @click="mode = 'input'"
        />
      </div>
    </div>

    <div v-else-if="mode === 'display'" class="max-w-md space-y-4">
      <UFormField :label="t('accountSettings.phoneNumber.phoneNumber')">
        <UInput
          :value="user?.phoneNumber"
          class="w-full"
          size="lg"
          disabled
          variant="subtle"
        />
      </UFormField>

      <UButton
        color="neutral"
        :label="t('accountSettings.phoneNumber.changeNumber')"
        @click="mode = 'input'"
      />
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import { phoneSchema } from '@@/shared/validations/auth'

const { t } = useI18n()
const { user, fetch: refreshSession } = useUserSession()
const toast = useToast()
const loading = ref(false)
const resendLoading = ref(false)
const resendCountdown = ref(0)
const phoneNumber = ref(user.value?.phoneNumber || '')
const otpCode = ref<string[]>([])
const mode = ref(user.value?.phoneNumber ? 'display' : 'input')

const isValidPhoneNumber = computed(() => {
  try {
    phoneSchema.parse({ phoneNumber: phoneNumber.value })
    return true
  } catch {
    return false
  }
})

const startResendCountdown = () => {
  resendCountdown.value = 60
  const timer = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const sendVerificationCode = async () => {
  try {
    if (!isValidPhoneNumber.value) {
      toast.add({
        title: t('accountSettings.phoneNumber.invalidPhoneNumber'),
        description: t('accountSettings.phoneNumber.invalidPhoneNumberDescription'),
        color: 'error',
      })
      return
    }

    loading.value = true
    await $fetch('/api/me/phone/send-verification', {
      method: 'POST',
      body: { phoneNumber: phoneNumber.value },
    })

    mode.value = 'verify'
    startResendCountdown()

    toast.add({
      title: t('accountSettings.phoneNumber.verificationCodeSent'),
      description: t('accountSettings.phoneNumber.verificationCodeSentDescription'),
      color: 'success',
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: t('toast.failedToSendVerificationCode.title'),
      description: (error as any)?.data?.message || t('errors.generic'),
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

const verifyCode = async () => {
  try {
    loading.value = true

    await $fetch('/api/me/phone/verify', {
      method: 'POST',
      body: {
        phoneNumber: phoneNumber.value,
        code: otpCode.value.join(''),
      },
    })

    await refreshSession()
    mode.value = 'display'

    toast.add({
      title: t('accountSettings.phoneNumber.phoneNumberVerified'),
      description: t('accountSettings.phoneNumber.phoneNumberVerifiedDescription'),
      color: 'success',
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: t('toast.failedToVerifyCode.title'),
      description: (error as any)?.data?.message || t('errors.generic'),
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

const removePhoneNumber = async () => {
  try {
    loading.value = true

    await $fetch('/api/me/phone', {
      method: 'DELETE',
    })

    await refreshSession()
    phoneNumber.value = ''
    mode.value = 'input'

    toast.add({
      title: t('accountSettings.phoneNumber.phoneNumberRemoved'),
      description: t('accountSettings.phoneNumber.phoneNumberRemovedDescription'),
      color: 'success',
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: t('toast.failedToRemovePhoneNumber.title'),
      description: (error as any)?.data?.message || t('errors.generic'),
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>
