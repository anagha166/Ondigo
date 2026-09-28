import { CLASS_TEMPLATES, SEMESTER_END, SEMESTER_START } from '../data/semester'
import type { ClassSession, ClassTemplate, DayMark, PlanEntry } from '../types'
import { addDays, blockedOnDate, coversDate, parseIso, toIso, tripOnDate } from './plan'

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1)
}

export function monthTitle(date: Date) {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function monthShort(date: Date) {
  return date.toLocaleDateString('en-GB', { month: 'short' })
}

/** Monday-first cells for a month grid. */
export function monthCells(month: Date): (string | null)[] {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const days = new Date(year, monthIndex + 1, 0).getDate()
  const leading = Array.from({ length: firstWeekday }, () => null)
  const dates = Array.from({ length: days }, (_, index) =>
    toIso(new Date(year, monthIndex, index + 1)),
  )
  return [...leading, ...dates]
}

export function semesterMonths(startIso = SEMESTER_START, endIso = SEMESTER_END) {
  const months: Date[] = []
  let cursor = startOfMonth(parseIso(startIso))
  const last = startOfMonth(parseIso(endIso))
  while (cursor <= last) {
    months.push(cursor)
    cursor = addMonths(cursor, 1)
  }
  return months
}

export function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function expandClasses(
  templates: ClassTemplate[] = CLASS_TEMPLATES,
  startIso = SEMESTER_START,
  endIso = SEMESTER_END,
): ClassSession[] {
  const sessions: ClassSession[] = []
  let cursor = startIso
  while (cursor <= endIso) {
    const weekday = parseIso(cursor).getDay()
    for (const template of templates) {
      if (template.weekdays.includes(weekday)) {
        sessions.push({
          type: 'class',
          title: template.title,
          date: cursor,
          startTime: template.startTime,
          endTime: template.endTime,
        })
      }
    }
    cursor = addDays(cursor, 1)
  }
  return sessions
}

export function markDay(
  iso: string,
  entries: PlanEntry[],
  classes: ClassSession[],
): DayMark {
  const trip = tripOnDate(entries, iso)
  const blocked = blockedOnDate(entries, iso)
  return {
    iso,
    trip,
    blocked,
    classes: classes.filter((session) => session.date === iso),
    isGap: !trip && !blocked,
  }
}

export function inSemester(
  iso: string,
  startIso = SEMESTER_START,
  endIso = SEMESTER_END,
) {
  return coversDate(startIso, endIso, iso)
}

export const GCAL_KEY = 'ondigo.gcal'

export function isGcalConnected() {
  return sessionStorage.getItem(GCAL_KEY) === '1'
}

export function setGcalConnected() {
  sessionStorage.setItem(GCAL_KEY, '1')
}

export function mergeClassTemplates(
  current: ClassTemplate[],
  incoming: ClassTemplate[],
) {
  const seen = new Set(current.map((item) => item.title.toLowerCase()))
  return [
    ...current,
    ...incoming.filter((item) => !seen.has(item.title.toLowerCase())),
  ]
}
