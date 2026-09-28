import type { TimedSuggestion, TripCategory, TripEntry, UserProfile, WishlistItem } from '../types'
import { addDays, buildTimeline, daysBetween, formatRange, parseIso } from './plan'

export const INTERESTS = [
  'Art',
  'Food',
  'Beach',
  'Mountains',
  'Cities',
  'Nature',
  'History',
  'Nightlife',
] as const

type Place = {
  destination: string
  category: TripCategory
  reason: string
  tags: string[]
  stayDays: number
  /** 1–12 */
  bestMonths: number[]
  avoidMonths: number[]
  crowdNote: string
  seasonNote: string
}

const CATALOG: Place[] = [
  {
    destination: 'Florence',
    category: 'city',
    reason: 'Uffizi, Duomo, and a walkable art city.',
    tags: ['art', 'history', 'cities', 'museum', 'gallery', 'renaissance'],
    stayDays: 3,
    bestMonths: [10, 11, 2, 3],
    avoidMonths: [7, 8],
    crowdNote: 'Weekdays in November beat the summer queue.',
    seasonNote: 'Best late fall, after the August crush.',
  },
  {
    destination: 'Venice',
    category: 'city',
    reason: 'Canals, Biennale energy, and a long weekend pace.',
    tags: ['art', 'cities', 'history', 'travel'],
    stayDays: 3,
    bestMonths: [10, 11, 1, 2],
    avoidMonths: [7, 8],
    crowdNote: 'Skip July day-trippers. Late fall is quieter on the vaporetti.',
    seasonNote: 'October–February, not high summer.',
  },
  {
    destination: 'Cinque Terre',
    category: 'beach',
    reason: 'Cliff towns and swims between trains.',
    tags: ['beach', 'nature', 'travel', 'sea', 'coast', 'hike'],
    stayDays: 3,
    bestMonths: [5, 6, 9, 10],
    avoidMonths: [7, 8],
    crowdNote: 'Trails and trains ease after mid-October.',
    seasonNote: 'Shoulder season: still swimmable, not August packed.',
  },
  {
    destination: 'Vienna',
    category: 'city',
    reason: 'Secession art, coffee houses, and museums.',
    tags: ['art', 'history', 'cities', 'food', 'museum'],
    stayDays: 3,
    bestMonths: [10, 11, 12],
    avoidMonths: [7],
    crowdNote: 'Late November markets, before Christmas-week crush.',
    seasonNote: 'Fall into early winter — coffee-house weather.',
  },
  {
    destination: 'Interlaken',
    category: 'mountains',
    reason: 'Alps in a weekend — lakes and ridge walks.',
    tags: ['mountains', 'nature', 'hike', 'alps', 'travel'],
    stayDays: 3,
    bestMonths: [9, 10],
    avoidMonths: [7, 8],
    crowdNote: 'October trails are open; buses are quieter than July.',
    seasonNote: 'Go before winter closures, after summer peak.',
  },
  {
    destination: 'Lisbon',
    category: 'beach',
    reason: 'Light, tiles, and the Atlantic an hour away.',
    tags: ['beach', 'food', 'cities', 'travel', 'nightlife'],
    stayDays: 4,
    bestMonths: [10, 11, 3, 4],
    avoidMonths: [8],
    crowdNote: 'October is still mild. August heat and crowds are gone.',
    seasonNote: 'Spring or mid-fall, not August.',
  },
  {
    destination: 'Berlin',
    category: 'city',
    reason: 'Galleries by day, late nights after.',
    tags: ['art', 'nightlife', 'cities', 'history'],
    stayDays: 3,
    bestMonths: [10, 11, 3],
    avoidMonths: [12],
    crowdNote: 'November galleries, not the December market crush.',
    seasonNote: 'Shoulder months — grey, cheap, awake.',
  },
  {
    destination: 'Scottish Highlands',
    category: 'nature',
    reason: 'Big skies, lochs, and empty roads.',
    tags: ['nature', 'mountains', 'hike', 'travel'],
    stayDays: 4,
    bestMonths: [9, 10],
    avoidMonths: [12, 1],
    crowdNote: 'September light, before winter road and inn closures.',
    seasonNote: 'Early fall. Midwinter is beautiful and shut.',
  },
  {
    destination: 'Rome',
    category: 'city',
    reason: 'Ruins, churches, and carbonara as a day plan.',
    tags: ['art', 'history', 'food', 'cities', 'travel'],
    stayDays: 4,
    bestMonths: [10, 11, 3, 4],
    avoidMonths: [7, 8],
    crowdNote: 'October is warm. August is shut and packed.',
    seasonNote: 'Spring or fall, never midsummer.',
  },
  {
    destination: 'Barcelona',
    category: 'beach',
    reason: 'Gaudí, tapas, and a beach after class week.',
    tags: ['art', 'beach', 'food', 'cities', 'nightlife'],
    stayDays: 3,
    bestMonths: [5, 6, 10, 11],
    avoidMonths: [8],
    crowdNote: 'Early November: beach walks, no August crawl.',
    seasonNote: 'Late spring or fall.',
  },
  {
    destination: 'Prague',
    category: 'city',
    reason: 'Cheap trains, old town, and a beer hall night.',
    tags: ['cities', 'history', 'nightlife', 'travel', 'food'],
    stayDays: 3,
    bestMonths: [10, 11, 1],
    avoidMonths: [7, 12],
    crowdNote: 'November is walkable. December markets get tight.',
    seasonNote: 'Late fall, not Christmas week unless you want that crush.',
  },
  {
    destination: 'Nice',
    category: 'beach',
    reason: 'Promenade mornings and a Côte d’Azur reset.',
    tags: ['beach', 'art', 'food', 'travel'],
    stayDays: 3,
    bestMonths: [5, 6, 9, 10],
    avoidMonths: [7, 8],
    crowdNote: 'October promenade, not July beach towels.',
    seasonNote: 'Shoulder Mediterranean — still outdoor, fewer bodies.',
  },
]

function monthOf(iso: string) {
  return parseIso(iso).getMonth() + 1
}

function scorePlace(place: Place, interests: string[], note: string) {
  const haystack = `${interests.join(' ')} ${note}`.toLowerCase()
  const words = haystack.split(/[^a-z]+/).filter(Boolean)
  return place.tags.filter((tag) => haystack.includes(tag) || words.includes(tag)).length
}

type Window = { startDate: string; endDate: string; friday: boolean }

function gapFits(gapStart: string, gapEnd: string, stayDays: number): Window[] {
  const fits: Window[] = []
  if (daysBetween(gapStart, gapEnd) + 1 < stayDays) return fits
  let cursor = gapStart
  while (addDays(cursor, stayDays - 1) <= gapEnd) {
    fits.push({
      startDate: cursor,
      endDate: addDays(cursor, stayDays - 1),
      friday: parseIso(cursor).getDay() === 5,
    })
    cursor = addDays(cursor, 1)
  }
  return fits
}

function overlaps(a: { startDate: string; endDate: string }, b: { startDate: string; endDate: string }) {
  return a.startDate <= b.endDate && b.startDate <= a.endDate
}

function windowScore(place: Place, slot: Window) {
  const month = monthOf(slot.startDate)
  let score = 0
  if (place.bestMonths.includes(month)) score += 20
  if (place.avoidMonths.includes(month)) score -= 40
  if (slot.friday) score += 5
  return score
}

function rankedPlaces(interests: string[], note: string) {
  const scored = CATALOG.map((place) => ({
    place,
    hits: scorePlace(place, interests, note),
  })).sort((a, b) => b.hits - a.hits)
  const matched = scored.filter((row) => row.hits > 0)
  return (matched.length > 0 ? matched : scored).map((row) => row.place)
}

export function suggestTrips(interests: string[], note: string): WishlistItem[] {
  return rankedPlaces(interests, note)
    .slice(0, 4)
    .map((place) => ({
      destination: place.destination,
      category: place.category,
      reason: `${place.reason} ${place.seasonNote} ${place.crowdNote}`,
    }))
}

/** Places plus a quieter window that fits an open gap in the term. */
export function suggestWhenToGo(profile: UserProfile): TimedSuggestion[] {
  const booked = new Set(profile.trips.map((trip) => trip.destination.toLowerCase()))
  const gaps = buildTimeline(profile.trips, profile.startDate, profile.endDate).filter(
    (item) => item.type === 'gap',
  )
  const used: Window[] = []
  const out: TimedSuggestion[] = []

  for (const place of rankedPlaces(profile.interests, profile.interestNote)) {
    if (booked.has(place.destination.toLowerCase())) continue
    if (out.length >= 4) break

    const open = gaps
      .flatMap((gap) => gapFits(gap.startDate, gap.endDate, place.stayDays))
      .filter((slot) => !used.some((taken) => overlaps(taken, slot)))
    if (open.length === 0) continue

    const picked = [...open].sort((left, right) => {
      const delta = windowScore(place, right) - windowScore(place, left)
      if (delta !== 0) return delta
      return left.startDate.localeCompare(right.startDate)
    })[0]!

    used.push(picked)
    out.push({
      destination: place.destination,
      category: place.category,
      reason: place.reason,
      startDate: picked.startDate,
      endDate: picked.endDate,
      crowdNote: place.crowdNote,
      seasonNote: place.seasonNote,
    })
  }

  return out
}

export function suggestionDays(suggestions: TimedSuggestion[]) {
  const days = new Set<string>()
  for (const item of suggestions) {
    let cursor = item.startDate
    while (cursor <= item.endDate) {
      days.add(cursor)
      cursor = addDays(cursor, 1)
    }
  }
  return days
}

export function toTrip(suggestion: TimedSuggestion): TripEntry {
  return {
    type: 'trip',
    destination: suggestion.destination,
    startDate: suggestion.startDate,
    endDate: suggestion.endDate,
    cost: 0,
    category: suggestion.category,
  }
}

export function suggestionWhen(suggestion: TimedSuggestion) {
  return formatRange(suggestion.startDate, suggestion.endDate)
}
