export type TripCategory = 'beach' | 'city' | 'mountains' | 'nature'

export type TripEntry = {
  type: 'trip'
  destination: string
  startDate: string
  endDate: string
  cost: number
  category: TripCategory
}

export type BlockedEntry = {
  type: 'blocked'
  label: string
  startDate: string
  endDate: string
}

export type PlanEntry = TripEntry | BlockedEntry

export type GapEntry = {
  type: 'gap'
  startDate: string
  endDate: string
}

export type TimelineItem = PlanEntry | GapEntry

export type ClassTemplate = {
  title: string
  /** 1 = Monday … 5 = Friday */
  weekdays: number[]
  startTime: string
  endTime: string
}

export type ClassSession = {
  type: 'class'
  title: string
  date: string
  startTime: string
  endTime: string
}

export type DayMark = {
  iso: string
  trip?: TripEntry
  blocked?: BlockedEntry
  classes: ClassSession[]
  isGap: boolean
}

export type WishlistItem = {
  destination: string
  category: TripCategory
  reason: string
}

export type TimedSuggestion = {
  destination: string
  category: TripCategory
  reason: string
  startDate: string
  endDate: string
  crowdNote: string
  seasonNote: string
}

export type UserAccount = {
  name: string
  email: string
}

export type UserProfile = {
  city: string
  startDate: string
  endDate: string
  classes: ClassTemplate[]
  trips: TripEntry[]
  wishlist: WishlistItem[]
  interests: string[]
  interestNote: string
}
