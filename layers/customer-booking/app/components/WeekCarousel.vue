<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'

interface Props {
  modelValue?: Date | null
  weekStartsOn?: 0 | 1 // 0 = Sunday, 1 = Monday
  initialWeeks?: number // Initial weeks to load (will expand dynamically)
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  weekStartsOn: 1,
  initialWeeks: 12, // Start with 12 weeks, expand as needed
})

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
  'weekChange': [weekStart: Date, weekEnd: Date]
  'dayHover': [date: Date | null]
}>()

const carousel = useTemplateRef('carousel')

// Track the range of week offsets we've generated (relative to today)
const earliestWeekOffset = ref(-Math.floor(props.initialWeeks / 2))
const latestWeekOffset = ref(Math.ceil(props.initialWeeks / 2) - 1)

// Generate weeks dynamically
const weeks = ref<Array<{
  id: number
  weekStart: DateValue
  days: ReturnType<typeof generateWeekDays>
}>>([])

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

// Generate a week object for a given offset from today
function generateWeek(offset: number) {
  const todayDate = today(getLocalTimeZone())
  const weekStart = getWeekStart(todayDate.add({ weeks: offset }))
  return {
    id: offset,
    weekStart,
    days: generateWeekDays(weekStart),
  }
}

// Initialize weeks array
function initializeWeeks() {
  const result = []
  for (let i = earliestWeekOffset.value; i <= latestWeekOffset.value; i++) {
    result.push(generateWeek(i))
  }
  weeks.value = result
}

// Add weeks to the past (beginning of array)
function addWeeksToPast(count: number = 4) {
  const newWeeks = []
  for (let i = 0; i < count; i++) {
    earliestWeekOffset.value--
    newWeeks.unshift(generateWeek(earliestWeekOffset.value))
  }
  weeks.value = [...newWeeks, ...weeks.value]

  // Adjust carousel position to maintain current view
  nextTick(() => {
    const api = carousel.value?.emblaApi
    if (api) {
      const currentIndex = api.selectedScrollSnap()
      api.scrollTo(currentIndex + count, false) // false = no animation
    }
  })
}

// Add weeks to the future (end of array)
function addWeeksToFuture(count: number = 4) {
  const newWeeks = []
  for (let i = 0; i < count; i++) {
    latestWeekOffset.value++
    newWeeks.push(generateWeek(latestWeekOffset.value))
  }
  weeks.value = [...weeks.value, ...newWeeks]
}

// Check if we need to expand and do so
function checkAndExpand(index: number) {
  const threshold = 3 // Start loading when within 3 weeks of edge

  // Near the beginning - add past weeks
  if (index < threshold) {
    addWeeksToPast(4)
  }

  // Near the end - add future weeks
  if (index > weeks.value.length - threshold - 1) {
    addWeeksToFuture(4)
  }
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
  // Find index of week containing today (offset 0)
  const todayIndex = weeks.value.findIndex(w => w.id === 0)
  if (todayIndex !== -1) {
    carousel.value?.emblaApi?.scrollTo(todayIndex)
  }
}

// Calculate start index (week containing today)
const startIndex = computed(() => {
  const idx = weeks.value.findIndex(w => w.id === 0)
  return idx !== -1 ? idx : Math.floor(weeks.value.length / 2)
})

// Handle carousel slide change
function onWeekSelect(index: number) {
  const week = weeks.value[index]
  if (week) {
    const weekStart = week.weekStart.toDate(getLocalTimeZone())
    const weekEnd = week.weekStart.add({ days: 6 }).toDate(getLocalTimeZone())
    emit('weekChange', weekStart, weekEnd)

    // Check if we need to expand
    checkAndExpand(index)
  }
}

// Initialize on mount
onMounted(() => {
  initializeWeeks()
  nextTick(() => {
    onWeekSelect(startIndex.value)
  })
})

// Scroll to a specific date's week
function scrollToDate(date: Date) {
  const targetDate = new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const targetWeekStart = getWeekStart(targetDate)

  // Find the week index that contains this date
  let weekIndex = weeks.value.findIndex((week) => {
    return week.weekStart.compare(targetWeekStart) === 0
  })

  // If not found, we may need to expand
  if (weekIndex === -1) {
    // Calculate how many weeks away from our range
    const todayDate = today(getLocalTimeZone())
    const todayWeekStart = getWeekStart(todayDate)

    // Calculate week difference
    const diffMs = targetWeekStart.toDate(getLocalTimeZone()).getTime() - todayWeekStart.toDate(getLocalTimeZone()).getTime()
    const weeksDiff = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))

    // Expand in the appropriate direction
    if (weeksDiff < earliestWeekOffset.value) {
      const weeksToAdd = earliestWeekOffset.value - weeksDiff + 4
      addWeeksToPast(weeksToAdd)
    } else if (weeksDiff > latestWeekOffset.value) {
      const weeksToAdd = weeksDiff - latestWeekOffset.value + 4
      addWeeksToFuture(weeksToAdd)
    }

    // Try finding again
    weekIndex = weeks.value.findIndex((week) => {
      return week.weekStart.compare(targetWeekStart) === 0
    })
  }

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
