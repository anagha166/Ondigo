import type { PlanEntry, TimelineItem, TripEntry, BlockedEntry } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

export function parseIso(iso: string) {
  return new Date(`${iso}T12:00:00`)
}

export function toIso(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(iso: string, count: number) {
  const date = parseIso(iso)
  date.setDate(date.getDate() + count)
  return toIso(date)
}

export function daysBetween(start: string, end: string) {
  return Math.round((parseIso(end).getTime() - parseIso(start).getTime()) / DAY_MS)
}

function compareEntries(a: PlanEntry, b: PlanEntry) {
  if (a.startDate !== b.startDate) return a.startDate < b.startDate ? -1 : 1
  if (a.endDate !== b.endDate) return a.endDate < b.endDate ? -1 : 1
  return 0
}

/** Insert open gaps wherever one planned block does not touch the next. */
export function buildTimeline(
  entries: PlanEntry[],
  semesterStart: string,
  semesterEnd: string,
): TimelineItem[] {
  const sorted = [...entries].sort(compareEntries)
  const timeline: TimelineItem[] = []
  let cursor = semesterStart

  for (const entry of sorted) {
    if (entry.startDate > cursor) {
      timeline.push({
        type: 'gap',
        startDate: cursor,
        endDate: addDays(entry.startDate, -1),
      })
    }
    timeline.push(entry)
    cursor = addDays(entry.endDate, 1)
  }

  if (cursor <= semesterEnd) {
    timeline.push({
      type: 'gap',
      startDate: cursor,
      endDate: semesterEnd,
    })
  }

  return timeline
}

export function coversDate(startDate: string, endDate: string, iso: string) {
  return iso >= startDate && iso <= endDate
}

export function tripOnDate(entries: PlanEntry[], iso: string): TripEntry | undefined {
  return entries.find(
    (entry): entry is TripEntry =>
      entry.type === 'trip' && coversDate(entry.startDate, entry.endDate, iso),
  )
}

export function blockedOnDate(entries: PlanEntry[], iso: string): BlockedEntry | undefined {
  return entries.find(
    (entry): entry is BlockedEntry =>
      entry.type === 'blocked' && coversDate(entry.startDate, entry.endDate, iso),
  )
}

export function monthKey(iso: string) {
  return iso.slice(0, 7)
}

export function monthLabel(iso: string) {
  return parseIso(iso).toLocaleDateString('en-GB', { month: 'long' })
}

export function formatRange(startDate: string, endDate: string) {
  const start = parseIso(startDate)
  const end = parseIso(endDate)
  const startMonth = start.toLocaleDateString('en-GB', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-GB', { month: 'short' })
  const startDay = start.getDate()
  const endDay = end.getDate()

  if (startDate === endDate) return `${startMonth} ${startDay}`
  if (startMonth === endMonth && start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${startDay}–${endDay}`
  }
  return `${startMonth} ${startDay}–${endMonth} ${endDay}`
}

export function formatMoney(amount: number) {
  return `€${amount}`
}

export function formatTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0)
  return date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })
}
