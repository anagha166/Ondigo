import type { ClassTemplate, PlanEntry } from '../types'

/** Inclusive semester window used to compute open time at the edges. */
export const SEMESTER_START = '2026-09-21'
export const SEMESTER_END = '2026-12-18'

export const SEMESTER_ENTRIES: PlanEntry[] = [
  {
    type: 'blocked',
    label: 'Orientation',
    startDate: '2026-09-21',
    endDate: '2026-09-22',
  },
  {
    type: 'trip',
    destination: 'Cinque Terre',
    startDate: '2026-10-02',
    endDate: '2026-10-05',
    cost: 86,
    category: 'beach',
  },
  {
    type: 'blocked',
    label: 'Midterms',
    startDate: '2026-10-12',
    endDate: '2026-10-14',
  },
  {
    type: 'trip',
    destination: 'Vienna',
    startDate: '2026-10-16',
    endDate: '2026-10-18',
    cost: 124,
    category: 'city',
  },
  {
    type: 'trip',
    destination: 'Interlaken',
    startDate: '2026-10-30',
    endDate: '2026-11-01',
    cost: 158,
    category: 'mountains',
  },
  {
    type: 'blocked',
    label: 'Exams',
    startDate: '2026-11-09',
    endDate: '2026-11-11',
  },
  {
    type: 'trip',
    destination: 'Lisbon',
    startDate: '2026-11-13',
    endDate: '2026-11-16',
    cost: 97,
    category: 'beach',
  },
  {
    type: 'trip',
    destination: 'Berlin',
    startDate: '2026-11-26',
    endDate: '2026-11-29',
    cost: 110,
    category: 'city',
  },
  {
    type: 'trip',
    destination: 'Highlands',
    startDate: '2026-12-04',
    endDate: '2026-12-07',
    cost: 142,
    category: 'nature',
  },
  {
    type: 'blocked',
    label: 'Finals',
    startDate: '2026-12-14',
    endDate: '2026-12-18',
  },
]

/** Example Bologna semester timetable, used after the fake GCal connect. */
export const CLASS_TEMPLATES: ClassTemplate[] = [
  {
    title: 'Italian I',
    weekdays: [1, 3],
    startTime: '09:00',
    endTime: '10:30',
  },
  {
    title: 'Renaissance Art',
    weekdays: [2, 4],
    startTime: '11:00',
    endTime: '12:30',
  },
  {
    title: 'EU Politics',
    weekdays: [3],
    startTime: '14:00',
    endTime: '16:00',
  },
  {
    title: 'Studio seminar',
    weekdays: [5],
    startTime: '10:00',
    endTime: '12:00',
  },
]
