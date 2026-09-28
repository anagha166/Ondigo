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
  about: string
  highlights: string[]
  travel: string
  tags: string[]
  stayDays: number
  /** 1–12 */
  bestMonths: number[]
  avoidMonths: number[]
  crowdNote: string
  seasonNote: string
}

export type PlaceGuide = Pick<
  Place,
  | 'destination'
  | 'category'
  | 'reason'
  | 'about'
  | 'highlights'
  | 'travel'
  | 'crowdNote'
  | 'seasonNote'
>

const CATALOG: Place[] = [
  {
    destination: 'Florence',
    category: 'city',
    reason: 'Uffizi, Duomo, and a walkable art city.',
    about:
      'Three days is enough if you pick a neighborhood and walk. Skip the 8am ticket panic — on a November weekday the Uffizi is a museum again.',
    highlights: ['Uffizi without the summer queue', 'Duomo climb', 'Dinner in Oltrarno'],
    travel: 'From Bologna, Frecciarossa is about 40 minutes. Santa Maria Novella is a short walk to the center.',
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
    about:
      'Stay overnight. Day-trippers leave by early evening and the city drops a register — that is the version worth the ticket.',
    highlights: ['Vaporetto after the rush', 'Accademia', 'One quieter island, not a checklist'],
    travel: 'Regionale from Bologna is about 1h30, or Freccia to Mestre and ten minutes more.',
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
    about:
      'Five towns on a rail line. Swim if the water is still warm, hike if it is not — you do not need all five in one weekend.',
    highlights: ['Monterosso swim', 'Vernazza harbor', 'One trail, not a town-hop marathon'],
    travel: 'Train via La Spezia. It slows after Pisa, which is the point.',
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
    about:
      'Palaces in the morning, a coffee house that does not mind if you sit, and one museum instead of four.',
    highlights: ['Belvedere', 'A long coffee-house afternoon', 'A leftover concert ticket if you luck into one'],
    travel: 'Nightjet or a cheap flight. From Bologna it is a long train or about 90 minutes in the air.',
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
    about:
      'Two lakes, one ridge, and an early train so you are not walking with the coach tours.',
    highlights: ['A lake boat or Harder Kulm', 'One ridge walk', 'A meal you earned'],
    travel: 'Train via Milan and Spiez. It is a long day; sleep in Interlaken, not in a station.',
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
    about:
      'Hills, tiles, and a train to the Atlantic when the city feels tight. Four days lets you stop rushing the viewpoints.',
    highlights: ['Tram once, then walk', 'A neighborhood tasca, not a viewpoint dinner', 'Cascais for the afternoon'],
    travel: 'From most Erasmus cities this is a flight. Book a midweek overnight and it stays cheap.',
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
    about:
      'A city that does not close at eleven. One museum morning, then let the rest of the trip be neighborhoods.',
    highlights: ['Museum Island once', 'A gallery in Mitte you did not plan', 'Kreuzberg after midnight'],
    travel: 'Flix or a flight. From Bologna it is about two hours in the air.',
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
    about:
      'Go north of Inverness or pick one loch and stay. Four days, or the travel eats the trip.',
    highlights: ['One glen walk', 'A quiet inn lunch', 'Skip the coach loop'],
    travel: 'Fly to Inverness or Edinburgh, then a long train or a hired car.',
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
    about:
      'Ruins in the morning, a neighborhood lunch, churches when the light drops. Four days keeps it from becoming a sprint.',
    highlights: ['Forum before noon', 'Testaccio for food', 'Borghese if you book ahead'],
    travel: 'Frecciarossa from Bologna is about 2h15. Termini is chaotic; walk south.',
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
    about:
      'One Gaudí, then get off the Rambla. In November the beach is for walking, not for towels.',
    highlights: ['One Gaudí, not three', 'Dinner in Gràcia', 'Barceloneta at dusk'],
    travel: 'From Bologna a two-hour flight. If you already live here, treat it as a local reset.',
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
    about:
      'Old town is a morning. The rest of the weekend is a neighborhood and a beer hall that still feels like one in November.',
    highlights: ['Castle at opening', 'A street off the square', 'One night in Žižkov'],
    travel: 'Flix or a flight. From Bologna it is about 90 minutes in the air.',
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
    about:
      'Promenade in the morning, a museum if it rains, socca for lunch. A reset, not a sightseeing raid.',
    highlights: ['Promenade des Anglais', 'Musée Matisse', 'Villefranche if you have a spare afternoon'],
    travel: 'Train via Milan and Genoa, or fly Nice. Arriving along the coast is the nicer version.',
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

export function placeGuide(destination: string): PlaceGuide | undefined {
  const place = CATALOG.find(
    (item) => item.destination.toLowerCase() === destination.toLowerCase(),
  )
  if (!place) return
  return {
    destination: place.destination,
    category: place.category,
    reason: place.reason,
    about: place.about,
    highlights: place.highlights,
    travel: place.travel,
    crowdNote: place.crowdNote,
    seasonNote: place.seasonNote,
  }
}
