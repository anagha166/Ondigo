import type { UserAccount, UserProfile } from '../types'

export const USER_KEY = 'ondigo.user'
export const PROFILE_KEY = 'ondigo.profile'

const EMPTY_PROFILE: UserProfile = {
  city: '',
  startDate: '',
  endDate: '',
  classes: [],
  trips: [],
  wishlist: [],
  interests: [],
  interestNote: '',
}

export function emptyProfile(): UserProfile {
  return {
    ...EMPTY_PROFILE,
    classes: [],
    trips: [],
    wishlist: [],
    interests: [],
  }
}

export function loadUser(): UserAccount | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as UserAccount
    if (!parsed.name || !parsed.email) return null
    return parsed
  } catch {
    return null
  }
}

export function saveUser(user: UserAccount) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function loadProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY)
  if (!raw) return null
  try {
    return { ...emptyProfile(), ...(JSON.parse(raw) as UserProfile) }
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function isProfileReady(profile: UserProfile | null) {
  return Boolean(profile?.city && profile.startDate && profile.endDate)
}

export function clearSession() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(PROFILE_KEY)
}
