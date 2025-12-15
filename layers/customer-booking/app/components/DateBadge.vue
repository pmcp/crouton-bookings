<script setup lang="ts">
interface Props {
  date: Date | string
  size?: 'sm' | 'md'
  variant?: 'primary' | 'error' | 'muted' | 'elevated'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary',
})

const parsed = computed(() => {
  const d = typeof props.date === 'string' ? new Date(props.date) : props.date
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
  }
})

const sizeClasses = computed(() => {
  return props.size === 'sm'
    ? 'w-10 h-12 rounded'
    : 'w-11 h-14 rounded-lg'
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'error':
      return 'bg-error/10 text-error'
    case 'muted':
      return 'muted text-muted'
    case 'elevated':
      return 'elevated'
    case 'primary':
    default:
      return 'bg-primary/10 text-primary'
  }
})
</script>

<template>
  <div
    class="shrink-0 flex flex-col items-center justify-center transition-colors duration-200"
    :class="[sizeClasses, variantClasses]"
  >
    <span class="text-[9px] font-medium uppercase tracking-wide opacity-70">{{ parsed.weekday }}</span>
    <span class="text-lg font-bold leading-tight">{{ parsed.day }}</span>
    <span class="text-[9px] font-medium uppercase tracking-wide">{{ parsed.month }}</span>
  </div>
</template>
