<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'

interface Props {
  modelValue?: Date | null
  weekStartsOn?: 0 | 1 // 0 = Sunday, 1 = Monday
  numberOfWeeks?: number // How many weeks to show in carousel
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  weekStartsOn: 1,
  numberOfWeeks: 5, // Show 5 weeks: 2 past, current, 2 future
})

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
  'weekChange': [weekStart: Date, weekEnd: Date]
  'dayHover': [date: Date | null]
}>()

const carousel = useTemplateRef('carousel')

// Generate weeks array centered on current week
const weeks = computed(() => {
  const todayDate = today(getLocalTimeZone())
  const result = []

  // Calculate weeks before and after
  const weeksBefore = Math.floor(props.numberOfWeeks / 2)

  for (let i = -weeksBefore; i < props.numberOfWeeks - weeksBefore; i++) {
    const weekStart = getWeekStart(todayDate.add({ weeks: i }))
    result.push({
      id: i,
      weekStart,
      days: generateWeekDays(weekStart),
    })
  }

  return result
})

// Get the start of the week for a given date
function getWeekStart(date: DateValue): DateValue {
  const jsDate = date.toDate(getLocalTimeZone())
  const dayOfWeek = jsDate.getDay()
  const diff = props.weekStartsOn === 1
    ? (dayOfWeek === 0 ? -6 : 1 - dayOfWeek)
    : -dayOfWeek
  return date.add({ days: diff })
}

// Generate 7 days for a week
function generateWeekDays(weekStart: DateValue) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = weekStart.add({ days: i })
    days.push({
      date,
      day: date.day,
      weekday: new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date.toDate(getLocalTimeZone())),
      jsDate: date.toDate(getLocalTimeZone()),
    })
  }
  return days
}

// Format month label
function getMonthLabel(weekStart: DateValue): string {
  const startDate = weekStart.toDate(getLocalTimeZone())
  const endDate = weekStart.add({ days: 6 }).toDate(getLocalTimeZone())

  const monthYear = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })

  if (weekStart.month === weekStart.add({ days: 6 }).month) {
    return monthYear.format(startDate)
  }

  const startMonth = new Intl.DateTimeFormat('en', { month: 'short' }).format(startDate)
  const endMonthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(endDate)
  return `${startMonth} - ${endMonthYear}`
}

// Selection
const selectedDate = computed(() => {
  if (!props.modelValue) return null
  const d = props.modelValue
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
})

function isSelected(day: { date: DateValue }): boolean {
  if (!selectedDate.value) return false
  return day.date.compare(selectedDate.value) === 0
}

function isToday(day: { date: DateValue }): boolean {
  const todayDate = today(getLocalTimeZone())
  return day.date.compare(todayDate) === 0
}

function selectDay(day: { date: DateValue, jsDate: Date }) {
  emit('update:modelValue', day.jsDate)
}

// Go to today's week
function goToToday() {
  const centerIndex = Math.floor(props.numberOfWeeks / 2)
  carousel.value?.emblaApi?.scrollTo(centerIndex)
}

// Start at center (current week)
const startIndex = Math.floor(props.numberOfWeeks / 2)

// Handle carousel slide change
function onWeekSelect(index: number) {
  const week = weeks.value[index]
  if (week) {
    const weekStart = week.weekStart.toDate(getLocalTimeZone())
    const weekEnd = week.weekStart.add({ days: 6 }).toDate(getLocalTimeZone())
    emit('weekChange', weekStart, weekEnd)
  }
}

// Emit initial week on mount
onMounted(() => {
  onWeekSelect(startIndex)
})

// Scroll to a specific date's week
function scrollToDate(date: Date) {
  const targetDate = new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const targetWeekStart = getWeekStart(targetDate)

  // Find the week index that contains this date
  const weekIndex = weeks.value.findIndex((week) => {
    return week.weekStart.compare(targetWeekStart) === 0
  })

  if (weekIndex !== -1) {
    carousel.value?.emblaApi?.scrollTo(weekIndex)
  }
}

// Expose methods for parent
defineExpose({
  scrollToDate,
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <UCarousel
      ref="carousel"
      v-slot="{ item: week }"
      :items="weeks"
      :start-index="startIndex"
      :ui="{
        item: 'basis-full',
        prev: 'sm:-start-4',
        next: 'sm:-end-4',
      }"
      @select="onWeekSelect"
    >
      <div class="px-2">
        <!-- Header -->
        <div class="flex items-center justify-center mb-4">
          <button
            type="button"
            class="text-base font-medium hover:text-primary transition-colors"
            @click="goToToday"
          >
            {{ getMonthLabel(week.weekStart) }}
          </button>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="day in week.days"
            :key="day.date.toString()"
            class="flex flex-col items-center cursor-pointer group py-2"
            @click="selectDay(day)"
            @mouseenter="emit('dayHover', day.jsDate)"
            @mouseleave="emit('dayHover', null)"
          >
            <!-- Weekday label -->
            <span class="text-xs text-muted uppercase tracking-wider font-medium mb-1">
              {{ day.weekday }}
            </span>

            <!-- Day number -->
            <span
              :class="[
                'text-xl font-medium transition-colors mb-2',
                isSelected(day)
                  ? 'text-primary'
                  : isToday(day)
                    ? 'text-primary'
                    : 'text-default group-hover:text-primary',
              ]"
            >
              {{ day.day }}
            </span>

            <!-- Slot for indicators -->
            <div class="min-h-[20px]">
              <slot name="day" :day="day.date" :js-date="day.jsDate" />
            </div>
          </div>
        </div>
      </div>
    </UCarousel>
  </div>
</template>
