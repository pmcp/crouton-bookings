<script setup lang="ts">
interface Props {
  id: string
  locationTitle: string
  slotLabel: string
  slotColor?: string
  date: string | Date
  groupLabel?: string | null
  status?: 'confirmed' | 'pending' | 'cancelled' | string
  showStatus?: boolean
  actionType?: 'remove' | 'cancel' | 'delete'
  loading?: boolean
  showConfirmation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  slotColor: '#9ca3af',
  showStatus: false,
  actionType: 'remove',
  loading: false,
  showConfirmation: false,
})

const emit = defineEmits<{
  remove: []
  cancel: []
  delete: []
  'show-confirmation': []
  'hide-confirmation': []
}>()

// Date badge variant based on status
const dateBadgeVariant = computed(() => {
  return props.status === 'cancelled' ? 'error' : 'primary'
})

// Status badge color
function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'success'
    case 'completed':
      return 'neutral'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'error'
    default:
      return 'neutral'
  }
}

// Handle action click
function handleAction() {
  if (props.actionType === 'remove') {
    emit('remove')
  }
  else {
    emit('show-confirmation')
  }
}

// Confirm action
function confirmAction() {
  if (props.actionType === 'cancel') {
    emit('cancel')
  }
  else if (props.actionType === 'delete') {
    emit('delete')
  }
}
</script>

<template>
  <div class="bg-elevated/50 rounded-lg overflow-hidden">
    <div class="p-3 flex items-center gap-3">
      <!-- Date card -->
      <DateBadge :date="date" :variant="dateBadgeVariant" />

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate flex items-center gap-1">
          <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 text-muted shrink-0" />
          {{ locationTitle }}
        </p>
        <p class="text-xs text-muted mt-0.5 flex items-center gap-1.5">
          <UIcon name="i-lucide-clock" class="w-3 h-3" />
          <span>{{ slotLabel }}</span>
          <span
            class="w-2 h-2 rounded-full shrink-0 inline-block"
            :style="{ backgroundColor: slotColor || '#22c55e' }"
          />
          <template v-if="groupLabel">
            <span class="mx-1" />
            <UIcon name="i-lucide-users" class="w-3 h-3" />
            <span>{{ groupLabel }}</span>
          </template>
        </p>
      </div>

      <!-- Status + Action -->
      <div class="flex items-center gap-2 shrink-0">
        <UBadge
          v-if="showStatus && status"
          :color="getStatusColor(status)"
          variant="subtle"
          size="sm"
        >
          {{ status }}
        </UBadge>

        <!-- Action button -->
        <UButton
          v-if="!showConfirmation"
          variant="ghost"
          :color="actionType === 'delete' ? 'error' : 'neutral'"
          size="xs"
          :icon="actionType === 'delete' ? 'i-lucide-trash-2' : 'i-lucide-x'"
          class="transition-all duration-200 hover:scale-110"
          :class="actionType !== 'delete' && 'hover:rotate-90 hover:text-error'"
          @click="handleAction"
        />
      </div>
    </div>

    <!-- Confirmation row -->
    <div v-if="showConfirmation" class="px-3 pb-3">
      <div class="flex items-center justify-between gap-2 bg-error/10 rounded-lg px-3 py-2">
        <span class="text-xs text-muted">
          {{ actionType === 'delete' ? 'Delete permanently?' : 'Cancel this booking?' }}
        </span>
        <div class="flex items-center gap-2">
          <UButton
            variant="ghost"
            color="neutral"
            size="xs"
            @click="emit('hide-confirmation')"
          >
            Keep
          </UButton>
          <UButton
            variant="soft"
            color="error"
            size="xs"
            :loading="loading"
            @click="confirmAction"
          >
            {{ actionType === 'delete' ? 'Delete' : 'Cancel' }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
