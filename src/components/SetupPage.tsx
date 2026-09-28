import { useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { SEMESTER_END, SEMESTER_START } from '../data/semester'
import { emptyProfile, loadProfile, loadUser, saveProfile } from '../lib/profile'
import { INTERESTS, suggestWhenToGo, suggestionWhen } from '../lib/suggest'
import type {
  ClassTemplate,
  TimedSuggestion,
  TripCategory,
  TripEntry,
  UserProfile,
  WishlistItem,
} from '../types'
import { CategoryIcon } from './Icons'
import { Wordmark } from './Wordmark'

const STEPS = ['Home', 'Classes', 'Trips', 'Ideas'] as const
const CITIES = ['Bologna', 'Barcelona', 'Florence', 'Berlin', 'Lisbon', 'Paris', 'Madrid', 'Prague']
const WEEKDAY_TOGGLE = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
] as const
const CATEGORIES: { value: TripCategory; label: string }[] = [
  { value: 'city', label: 'City' },
  { value: 'beach', label: 'Beach' },
  { value: 'mountains', label: 'Mountains' },
  { value: 'nature', label: 'Nature' },
]

function weekdayLabel(days: number[]) {
  return days
    .map((day) => WEEKDAY_TOGGLE.find((item) => item.value === day)?.label)
    .filter(Boolean)
    .join(' · ')
}

export function SetupPage() {
  const navigate = useNavigate()
  const user = loadUser()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<UserProfile>(
    () => loadProfile() ?? { ...emptyProfile(), startDate: SEMESTER_START, endDate: SEMESTER_END },
  )
  const [classDraft, setClassDraft] = useState({
    title: '',
    weekdays: [1, 3] as number[],
    startTime: '09:00',
    endTime: '10:30',
  })
  const [tripDraft, setTripDraft] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    category: 'city' as TripCategory,
  })
  const [wishDraft, setWishDraft] = useState('')
  const [ideas, setIdeas] = useState<TimedSuggestion[]>([])

  const suggestions = useMemo(() => suggestWhenToGo(profile), [profile])

  if (!user) return <Navigate to="/login" replace />

  function patch(next: Partial<UserProfile>) {
    setProfile((current) => ({ ...current, ...next }))
  }

  function persist(next: UserProfile) {
    saveProfile(next)
    setProfile(next)
  }

  function addClass(event: FormEvent) {
    event.preventDefault()
    const title = classDraft.title.trim()
    if (!title || classDraft.weekdays.length === 0) return
    const nextClass: ClassTemplate = {
      title,
      weekdays: [...classDraft.weekdays].sort(),
      startTime: classDraft.startTime,
      endTime: classDraft.endTime,
    }
    persist({ ...profile, classes: [...profile.classes, nextClass] })
    setClassDraft({ title: '', weekdays: [1, 3], startTime: '09:00', endTime: '10:30' })
  }

  function addTrip(event: FormEvent) {
    event.preventDefault()
    const destination = tripDraft.destination.trim()
    if (!destination || !tripDraft.startDate || !tripDraft.endDate) return
    const nextTrip: TripEntry = {
      type: 'trip',
      destination,
      startDate: tripDraft.startDate,
      endDate: tripDraft.endDate < tripDraft.startDate ? tripDraft.startDate : tripDraft.endDate,
      cost: 0,
      category: tripDraft.category,
    }
    persist({ ...profile, trips: [...profile.trips, nextTrip] })
    setTripDraft({ destination: '', startDate: '', endDate: '', category: 'city' })
  }

  function addWish(item: WishlistItem) {
    if (profile.wishlist.some((row) => row.destination === item.destination)) return
    persist({ ...profile, wishlist: [...profile.wishlist, item] })
  }

  function addCustomWish(event: FormEvent) {
    event.preventDefault()
    const destination = wishDraft.trim()
    if (!destination) return
    addWish({
      destination,
      category: 'city',
      reason: 'On your list for this semester.',
    })
    setWishDraft('')
  }

  function finish() {
    persist(profile)
    navigate('/calendar')
  }

  return (
    <div className="min-h-dvh bg-indigo text-ink antialiased">
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pt-10 pb-12">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="no-underline text-ink">
            <Wordmark size="sm" />
          </Link>
          <p className="text-sm text-quiet">
            {step + 1} / {STEPS.length}
          </p>
        </div>

        <div className="mt-6 flex gap-2" aria-hidden>
          {STEPS.map((label, index) => (
            <span
              key={label}
              className={`h-1 flex-1 ${index <= step ? 'bg-glow' : 'bg-indigo-mid'}`}
            />
          ))}
        </div>

        {step === 0 && (
          <section className="mt-12 flex flex-1 flex-col">
            <h1 className="font-display text-4xl leading-10 font-extrabold tracking-tight">
              Where are you living?
            </h1>
            <p className="mt-4 text-lg leading-8 text-quiet">
              Home base and how long you’ll be there. We hang the calendar on this.
            </p>
            <div className="mt-10 flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => patch({ city })}
                  className={`min-h-10 px-4 text-sm ${profile.city === city ? 'bg-ink text-indigo' : 'border border-line text-ink'}`}
                >
                  {city}
                </button>
              ))}
            </div>
            <label className="mt-8 block">
              <span className="text-xs tracking-[0.16em] text-quiet uppercase">Or type a city</span>
              <input
                className="ui-field"
                value={profile.city}
                onChange={(event) => patch({ city: event.target.value })}
                placeholder="Bologna"
              />
            </label>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs tracking-[0.16em] text-quiet uppercase">From</span>
                <input
                  className="ui-field"
                  type="date"
                  value={profile.startDate}
                  onChange={(event) => patch({ startDate: event.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs tracking-[0.16em] text-quiet uppercase">Until</span>
                <input
                  className="ui-field"
                  type="date"
                  value={profile.endDate}
                  onChange={(event) => patch({ endDate: event.target.value })}
                />
              </label>
            </div>
            <button
              type="button"
              className="ui-btn mt-auto"
              disabled={!profile.city.trim() || !profile.startDate || !profile.endDate}
              onClick={() => {
                persist(profile)
                setStep(1)
              }}
            >
              Next
            </button>
          </section>
        )}

        {step === 1 && (
          <section className="mt-12 flex flex-1 flex-col">
            <h1 className="font-display text-4xl leading-10 font-extrabold tracking-tight">
              Put in your classes
            </h1>
            <p className="mt-4 text-lg leading-8 text-quiet">
              Manual is fine. You can still pull Google Calendar later.
            </p>
            <form onSubmit={addClass} className="mt-10 flex flex-col gap-6">
              <label className="block">
                <span className="text-xs tracking-[0.16em] text-quiet uppercase">Class</span>
                <input
                  className="ui-field"
                  value={classDraft.title}
                  onChange={(event) =>
                    setClassDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Italian I"
                />
              </label>
              <div>
                <p className="text-xs tracking-[0.16em] text-quiet uppercase">Days</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {WEEKDAY_TOGGLE.map((day) => {
                    const on = classDraft.weekdays.includes(day.value)
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() =>
                          setClassDraft((current) => ({
                            ...current,
                            weekdays: on
                              ? current.weekdays.filter((value) => value !== day.value)
                              : [...current.weekdays, day.value],
                          }))
                        }
                        className={`min-h-10 px-3 text-sm ${on ? 'bg-class text-indigo-deep' : 'border border-line text-ink'}`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs tracking-[0.16em] text-quiet uppercase">Starts</span>
                  <input
                    className="ui-field"
                    type="time"
                    value={classDraft.startTime}
                    onChange={(event) =>
                      setClassDraft((current) => ({ ...current, startTime: event.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-xs tracking-[0.16em] text-quiet uppercase">Ends</span>
                  <input
                    className="ui-field"
                    type="time"
                    value={classDraft.endTime}
                    onChange={(event) =>
                      setClassDraft((current) => ({ ...current, endTime: event.target.value }))
                    }
                  />
                </label>
              </div>
              <button type="submit" className="ui-btn-ghost">
                Add class
              </button>
            </form>
            {profile.classes.length > 0 && (
              <ul className="mt-8 flex flex-col gap-3">
                {profile.classes.map((item, index) => (
                  <li key={`${item.title}-${index}`} className="flex items-center justify-between gap-3">
                    <p>
                      {item.title}
                      <span className="text-quiet">
                        {' '}
                        · {weekdayLabel(item.weekdays)} · {item.startTime}–{item.endTime}
                      </span>
                    </p>
                    <button
                      type="button"
                      className="min-h-12 text-quiet hover:text-ink"
                      onClick={() =>
                        persist({
                          ...profile,
                          classes: profile.classes.filter((_, current) => current !== index),
                        })
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto flex gap-3 pt-10">
              <button type="button" className="ui-btn-ghost" onClick={() => setStep(0)}>
                Back
              </button>
              <button
                type="button"
                className="ui-btn"
                onClick={() => {
                  persist(profile)
                  setStep(2)
                }}
              >
                {profile.classes.length > 0 ? 'Next' : 'Skip for now'}
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="mt-12 flex flex-1 flex-col">
            <h1 className="font-display text-4xl leading-10 font-extrabold tracking-tight">
              Trips already planned
            </h1>
            <p className="mt-4 text-lg leading-8 text-quiet">
              Locked-in weekends. Dates can be a Friday-to-Sunday or a full week.
            </p>
            <form onSubmit={addTrip} className="mt-10 flex flex-col gap-6">
              <label className="block">
                <span className="text-xs tracking-[0.16em] text-quiet uppercase">Where</span>
                <input
                  className="ui-field"
                  value={tripDraft.destination}
                  onChange={(event) =>
                    setTripDraft((current) => ({ ...current, destination: event.target.value }))
                  }
                  placeholder="Cinque Terre"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs tracking-[0.16em] text-quiet uppercase">Start</span>
                  <input
                    className="ui-field"
                    type="date"
                    value={tripDraft.startDate}
                    onChange={(event) =>
                      setTripDraft((current) => ({ ...current, startDate: event.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-xs tracking-[0.16em] text-quiet uppercase">End</span>
                  <input
                    className="ui-field"
                    type="date"
                    value={tripDraft.endDate}
                    onChange={(event) =>
                      setTripDraft((current) => ({ ...current, endDate: event.target.value }))
                    }
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTripDraft((current) => ({ ...current, category: item.value }))}
                    className={`min-h-10 px-4 text-sm ${tripDraft.category === item.value ? 'bg-ink text-indigo' : 'border border-line'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button type="submit" className="ui-btn-ghost">
                Add trip
              </button>
            </form>
            {profile.trips.length > 0 && (
              <ul className="mt-8 flex flex-col gap-3">
                {profile.trips.map((trip, index) => (
                  <li key={`${trip.destination}-${trip.startDate}`} className="flex items-center gap-3">
                    <CategoryIcon category={trip.category} className="size-5 text-glow" />
                    <p className="flex-1">
                      {trip.destination}
                      <span className="text-quiet">
                        {' '}
                        · {trip.startDate} – {trip.endDate}
                      </span>
                    </p>
                    <button
                      type="button"
                      className="min-h-12 text-quiet hover:text-ink"
                      onClick={() =>
                        persist({
                          ...profile,
                          trips: profile.trips.filter((_, current) => current !== index),
                        })
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto flex gap-3 pt-10">
              <button type="button" className="ui-btn-ghost" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="ui-btn"
                onClick={() => {
                  persist(profile)
                  setStep(3)
                }}
              >
                {profile.trips.length > 0 ? 'Next' : 'None yet'}
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="mt-12 flex flex-1 flex-col">
            <h1 className="font-display text-4xl leading-10 font-extrabold tracking-tight">
              Your bucket list
            </h1>
            <p className="mt-4 text-lg leading-8 text-quiet">
              Tell us what you like. We’ll pick quieter weeks that still fit your open dates.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const on = profile.interests.includes(interest)
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() =>
                      patch({
                        interests: on
                          ? profile.interests.filter((item) => item !== interest)
                          : [...profile.interests, interest],
                      })
                    }
                    className={`min-h-10 px-4 text-sm ${on ? 'bg-glow text-indigo-deep' : 'border border-line'}`}
                  >
                    {interest}
                  </button>
                )
              })}
            </div>
            <label className="mt-8 block">
              <span className="text-xs tracking-[0.16em] text-quiet uppercase">
                What kind of things do you like?
              </span>
              <textarea
                className="ui-field min-h-24 resize-none"
                rows={3}
                value={profile.interestNote}
                onChange={(event) => patch({ interestNote: event.target.value })}
                placeholder="I like art museums and weekends by the sea."
              />
            </label>
            <button
              type="button"
              className="ui-btn-ghost mt-6"
              onClick={() => {
                persist(profile)
                setIdeas(suggestions)
              }}
            >
              Help me
            </button>
            {ideas.length > 0 && (
              <ul className="mt-8 flex flex-col gap-5">
                {ideas.map((item) => (
                  <li key={item.destination} className="flex items-start gap-3">
                    <CategoryIcon category={item.category} className="mt-1 size-5 text-glow" />
                    <div className="min-w-0 flex-1">
                      <p className="text-lg">{item.destination}</p>
                      <p className="text-sm text-ink">{suggestionWhen(item)}</p>
                      <p className="text-sm text-quiet">{item.crowdNote}</p>
                      <p className="text-sm text-quiet">{item.seasonNote}</p>
                    </div>
                    <button
                      type="button"
                      className="min-h-12 shrink-0 text-glow hover:text-ink"
                      onClick={() =>
                        addWish({
                          destination: item.destination,
                          category: item.category,
                          reason: `${suggestionWhen(item)} · ${item.crowdNote}`,
                        })
                      }
                    >
                      {profile.wishlist.some((row) => row.destination === item.destination)
                        ? 'Added'
                        : 'Save'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={addCustomWish} className="mt-8 flex gap-3">
              <input
                className="ui-field"
                value={wishDraft}
                onChange={(event) => setWishDraft(event.target.value)}
                placeholder="Or type a place to remember"
              />
              <button type="submit" className="min-h-12 shrink-0 px-3 text-glow">
                Save
              </button>
            </form>
            {profile.wishlist.length > 0 && (
              <p className="mt-6 text-sm text-quiet">
                Bucket list: {profile.wishlist.map((item) => item.destination).join(', ')}
              </p>
            )}
            <div className="mt-auto flex gap-3 pt-10">
              <button type="button" className="ui-btn-ghost" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="button" className="ui-btn" onClick={finish}>
                Open calendar
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
