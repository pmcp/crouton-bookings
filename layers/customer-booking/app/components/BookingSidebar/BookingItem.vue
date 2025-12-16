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
  // Position indicator props
  totalSlots?: number
  slotPosition?: number
}

const props = withDefaults(defineProps<Props>(), {
  slotColor: '#9ca3af',
  showStatus: false,
  actionType: 'remove',
  loading: false,
  showConfirmation: false,
  totalSlots: 0,
  slotPosition: -1,
})

const emit = defineEmits<{
  remove: []
  cancel: []
  delete: []
  'show-confirmation': []
  'hide-confirmation': []
}>()

// Check if we have valid position info
const hasPositionInfo = computed(() => props.totalSlots > 0 && props.slotPosition >= 0)

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
      <div class="flex-1 flex flex-col gap-1">
        <p class="text-sm font-medium truncate flex items-center gap-1.5">
          <span class="truncate capitalize">{{ locationTitle }}</span>
        </p>
        <div class="mt-1 flex items-center">
          <!-- Position indicator or single dot -->
          <BookingsLocationsSlotSingleIndicator
            v-if="hasPositionInfo"
            :total-slots="totalSlots"
            :position="slotPosition"
            :color="slotColor"
            :label="slotLabel"
            size="sm"
          />
          <span
            v-else
            class="w-2 h-2 rounded-full shrink-0 inline-block"
            :style="{ backgroundColor: slotColor || '#22c55e' }"
          />
        </div>
        <div class="relative" style="left:-0.07em;margin-top: 0.15em">
          <UBadge v-if="groupLabel" color="neutral" variant="subtle" size="md" >
            {{ groupLabel }}
          </UBadge>
        </div>
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
