<template>
  <AppContainer :title="t('pages.domains.title')">
    <template #actions>
      <UButton
        color="neutral"
        :label="t('pages.domains.addDomain')"
        icon="i-lucide-plus"
        @click="showAddModal = true"
      />
    </template>

    <!-- Add Domain Modal -->
    <UModal
      v-model:open="showAddModal"
      :title="t('pages.domains.modal.title')"
      :description="t('pages.domains.modal.description')"
    >
      <template #body>
        <UForm
          :state="newDomainState"
          :schema="addDomainSchema"
          class="space-y-4"
          @submit="addDomain"
        >
          <UFormField :label="t('pages.domains.domain')" name="domain" required>
            <UInput
              v-model="newDomainState.domain"
              placeholder="mybusiness.com"
              class="w-full"
              size="lg"
            />
          </UFormField>

          <UButton
            type="submit"
            color="neutral"
            block
            size="lg"
            :loading="adding"
            :label="t('pages.domains.addDomain')"
          />
        </UForm>
      </template>
    </UModal>

    <div class="mx-auto max-w-4xl space-y-6">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <USkeleton v-for="i in 2" :key="i" class="h-24 w-full" />
      </div>

      <!-- Empty State -->
      <UAlert
        v-else-if="!domains?.length"
        :title="t('pages.domains.empty.title')"
        :description="t('pages.domains.empty.description')"
        icon="i-lucide-globe"
        color="neutral"
        variant="subtle"
      />

      <!-- Domain List -->
      <div v-else class="space-y-4">
        <div
          v-for="domain in domains"
          :key="domain.id"
          class="border-default bg-default rounded-lg border p-4"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="truncate font-medium">{{ domain.domain }}</span>
                <UBadge
                  v-if="domain.isPrimary"
                  color="primary"
                  variant="soft"
                  size="xs"
                  :label="t('pages.domains.primary')"
                />
                <UBadge
                  :color="getStatusColor(domain.status)"
                  :variant="domain.status === 'verified' ? 'soft' : 'subtle'"
                  size="xs"
                  :label="getStatusLabel(domain.status)"
                />
              </div>

              <!-- Verification Instructions -->
              <div v-if="domain.status !== 'verified'" class="mt-3 space-y-2">
                <p class="text-muted text-sm">
                  {{ t('pages.domains.verification.instructions') }}
                </p>
                <div class="bg-elevated rounded-md p-3 font-mono text-sm">
                  <div class="flex items-center justify-between gap-2">
                    <div class="min-w-0 flex-1 space-y-1">
                      <div class="text-muted text-xs">{{ t('pages.domains.verification.type') }}</div>
                      <div>TXT</div>
                    </div>
                    <div class="min-w-0 flex-[2] space-y-1">
                      <div class="text-muted text-xs">{{ t('pages.domains.verification.name') }}</div>
                      <div class="truncate">_crouton-verification</div>
                    </div>
                    <div class="min-w-0 flex-[3] space-y-1">
                      <div class="text-muted text-xs">{{ t('pages.domains.verification.value') }}</div>
                      <div class="flex items-center gap-2">
                        <span class="truncate">{{ domain.verificationToken }}</span>
                        <UButton
                          color="neutral"
                          variant="ghost"
                          size="xs"
                          icon="i-lucide-copy"
                          @click="copyToken(domain.verificationToken)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <p class="text-muted text-xs">
                  {{ t('pages.domains.verification.dnsNote') }}
                </p>
              </div>

              <!-- Verified Domain Info -->
              <div v-else class="mt-2">
                <p class="text-muted text-sm">
                  <UIcon name="i-lucide-check-circle" class="text-success mr-1 inline-block size-4" />
                  {{ t('pages.domains.verified') }}
                  <span v-if="domain.verifiedAt" class="text-muted">
                    {{ t('pages.domains.verifiedOn', { date: formatDate(domain.verifiedAt) }) }}
                  </span>
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex shrink-0 items-center gap-2">
              <UButton
                v-if="domain.status !== 'verified'"
                color="primary"
                variant="soft"
                size="sm"
                :label="t('buttons.verify')"
                :loading="verifying === domain.id"
                @click="verifyDomain(domain.id)"
              />
              <UButton
                v-else-if="!domain.isPrimary"
                color="neutral"
                variant="ghost"
                size="sm"
                :label="t('pages.domains.setPrimary')"
                :loading="settingPrimary === domain.id"
                @click="setPrimary(domain.id)"
              />
              <UButton
                color="error"
                variant="ghost"
                size="sm"
                icon="i-lucide-trash-2"
                :loading="deleting === domain.id"
                @click="deleteDomain(domain.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppContainer>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const { t } = useI18n()

interface Domain {
  id: string
  teamId: string
  domain: string
  status: 'pending' | 'verified' | 'failed'
  verificationToken: string
  verifiedAt: Date | null
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}

const { currentTeam } = useTeam()
const toast = useToast()

// State
const showAddModal = ref(false)
const adding = ref(false)
const verifying = ref<string | null>(null)
const deleting = ref<string | null>(null)
const settingPrimary = ref<string | null>(null)

const newDomainState = reactive({
  domain: '',
})

const addDomainSchema = computed(() => z.object({
  domain: z
    .string()
    .min(1, t('pages.domains.validation.required'))
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i, t('pages.domains.validation.invalidFormat')),
}))

// Fetch domains
const {
  data: domains,
  pending: loading,
  refresh,
} = await useFetch<Domain[]>(() => `/api/teams/${currentTeam.value.id}/domains`, {
  key: 'team-domains',
})

// Methods
const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified':
      return 'success'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'error'
    default:
      return 'neutral'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'verified':
      return t('pages.domains.status.verified')
    case 'pending':
      return t('pages.domains.status.pending')
    case 'failed':
      return t('pages.domains.status.failed')
    default:
      return status
  }
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const copyToken = async (token: string) => {
  await navigator.clipboard.writeText(token)
  toast.add({
    title: t('success.copied'),
    color: 'success',
  })
}

const addDomain = async (event: FormSubmitEvent<z.infer<typeof addDomainSchema.value>>) => {
  adding.value = true
  try {
    await $fetch(`/api/teams/${currentTeam.value.id}/domains`, {
      method: 'POST',
      body: { domain: event.data.domain.toLowerCase() },
    })

    toast.add({
      title: t('pages.domains.toast.added.title'),
      description: t('pages.domains.toast.added.description'),
      color: 'success',
    })

    showAddModal.value = false
    newDomainState.domain = ''
    await refresh()
  } catch (error: any) {
    toast.add({
      title: t('pages.domains.toast.addFailed'),
      description: error.data?.statusMessage || error.message,
      color: 'error',
    })
  } finally {
    adding.value = false
  }
}

const verifyDomain = async (domainId: string) => {
  verifying.value = domainId
  try {
    const result = await $fetch<{ verified: boolean; message: string }>(
      `/api/teams/${currentTeam.value.id}/domains/${domainId}/verify`,
      { method: 'POST' },
    )

    if (result.verified) {
      toast.add({
        title: t('pages.domains.toast.verified.title'),
        description: t('pages.domains.toast.verified.description'),
        color: 'success',
      })
    } else {
      toast.add({
        title: t('pages.domains.toast.verificationFailed'),
        description: result.message,
        color: 'warning',
      })
    }

    await refresh()
  } catch (error: any) {
    toast.add({
      title: t('pages.domains.toast.verificationError'),
      description: error.data?.statusMessage || error.message,
      color: 'error',
    })
  } finally {
    verifying.value = null
  }
}

const setPrimary = async (domainId: string) => {
  settingPrimary.value = domainId
  try {
    await $fetch(`/api/teams/${currentTeam.value.id}/domains/${domainId}/set-primary`, {
      method: 'POST',
    })

    toast.add({
      title: t('pages.domains.toast.primaryUpdated'),
      color: 'success',
    })

    await refresh()
  } catch (error: any) {
    toast.add({
      title: t('pages.domains.toast.setPrimaryFailed'),
      description: error.data?.statusMessage || error.message,
      color: 'error',
    })
  } finally {
    settingPrimary.value = null
  }
}

const deleteDomain = async (domainId: string) => {
  deleting.value = domainId
  try {
    await $fetch(`/api/teams/${currentTeam.value.id}/domains/${domainId}`, {
      method: 'DELETE',
    })

    toast.add({
      title: t('pages.domains.toast.removed'),
      color: 'success',
    })

    await refresh()
  } catch (error: any) {
    toast.add({
      title: t('pages.domains.toast.removeFailed'),
      description: error.data?.statusMessage || error.message,
      color: 'error',
    })
  } finally {
    deleting.value = null
  }
}
</script>
