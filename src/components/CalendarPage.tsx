import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { CLASS_TEMPLATES } from '../data/semester'
import {
  WEEKDAYS,
  addMonths,
  expandClasses,
  inSemester,
  isGcalConnected,
  markDay,
  mergeClassTemplates,
  monthCells,
  monthShort,
  sameMonth,
  semesterMonths,
  startOfMonth,
} from '../lib/calendar'
import { formatRange, formatTime, parseIso, toIso } from '../lib/plan'
import { isProfileReady, loadProfile, loadUser, saveProfile } from '../lib/profile'
import { placeGuide, suggestWhenToGo, suggestionDays, suggestionWhen, toTrip } from '../lib/suggest'
import type { TimedSuggestion, TripCategory, UserProfile, WishlistItem } from '../types'
import { BookIcon, CalendarIcon, CategoryIcon, ChevronIcon } from './Icons'
import { Wordmark } from './Wordmark'

const TRIP_WASH: Record<TripCategory, string> = {
  beach: 'bg-beach text-indigo-deep',
  city: 'bg-city text-indigo-deep',
  mountains: 'bg-mountains text-indigo-deep',
  nature: 'bg-nature text-indigo-deep',
}

const CATEGORY_LABEL: Record<TripCategory, string> = {
  beach: 'Beach',
  city: 'City',
  mountains: 'Mountains',
  nature: 'Nature',
}

type PanelId = 'ideas' | 'list'

const PANEL_LABEL: Record<PanelId, string> = {
  ideas: 'Where should I go',
  list: 'Bucket list',
}

export function CalendarPage() {
  const user = loadUser()
  const profile = loadProfile()
  const [gcal, setGcal] = useState(false)

  useEffect(() => {
    setGcal(isGcalConnected())
  }, [])

  if (!user) return <Navigate to="/login" replace />
  if (!isProfileReady(profile) || !profile) return <Navigate to="/setup" replace />

  return <CalendarView gcal={gcal} />
}

function CalendarView({ gcal }: { gcal: boolean }) {
  const user = loadUser()!
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile()!)
  const start = profile.startDate
  const end = profile.endDate
  const months = useMemo(() => semesterMonths(start, end), [start, end])
  const [month, setMonth] = useState(() => {
    const today = startOfMonth(new Date())
    const first = months[0]!
    const last = months[months.length - 1]!
    if (today < first) return first
    if (today > last) return last
    return today
  })
  const [selected, setSelected] = useState(() => {
    const today = toIso(new Date())
    return inSemester(today, start, end) ? today : start
  })
  const [openPanel, setOpenPanel] = useState<PanelId | null>(null)
  const [lookingAt, setLookingAt] = useState<TimedSuggestion | null>(null)

  const templates = useMemo(
    () => (gcal ? mergeClassTemplates(profile.classes, CLASS_TEMPLATES) : profile.classes),
    [gcal, profile.classes],
  )
  const classes = useMemo(
    () => expandClasses(templates, start, end),
    [templates, start, end],
  )
  const cells = useMemo(() => monthCells(month), [month])
  const today = toIso(new Date())
  const firstMonth = months[0]!
  const lastMonth = months[months.length - 1]!
  const canPrev = month > firstMonth
  const canNext = month < lastMonth
  const day = markDay(selected, profile.trips, classes)
  const picks = useMemo(() => suggestWhenToGo(profile), [profile])
  const pickDays = useMemo(() => suggestionDays(picks), [picks])
  const pickForDay = picks.find(
    (item) => selected >= item.startDate && selected <= item.endDate,
  )

  function lockIn(suggestion: TimedSuggestion) {
    const next = { ...profile, trips: [...profile.trips, toTrip(suggestion)] }
    saveProfile(next)
    setProfile(next)
    setSelected(suggestion.startDate)
    setMonth(startOfMonth(parseIso(suggestion.startDate)))
    setLookingAt(null)
    setOpenPanel(null)
  }

  function goMonth(next: Date) {
    if (next < firstMonth || next > lastMonth) return
    setMonth(next)
    const firstInTerm = monthCells(next)
      .filter((iso): iso is string => Boolean(iso))
      .find((iso) => inSemester(iso, start, end))
    if (firstInTerm) setSelected(firstInTerm)
  }

  function togglePanel(id: PanelId) {
    setOpenPanel((current) => (current === id ? null : id))
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (lookingAt) {
          setLookingAt(null)
          return
        }
        setOpenPanel(null)
      }
      if (event.key === 'ArrowLeft') goMonth(addMonths(month, -1))
      if (event.key === 'ArrowRight') goMonth(addMonths(month, 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [month, lookingAt])

  return (
    <div className="min-h-dvh bg-indigo text-ink antialiased">
      <header className="px-4 pt-6">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <Link to="/" className="min-h-12 no-underline text-ink">
            <Wordmark size="sm" />
          </Link>
          <Link to="/setup" className="text-right text-sm text-quiet no-underline hover:text-ink">
            {user.name} · {profile.city}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 pt-8 pb-20">
        <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2">
          <PanelButton
            label={PANEL_LABEL.ideas}
            count={picks.length}
            active={openPanel === 'ideas'}
            tone="ideas"
            onClick={() => togglePanel('ideas')}
          />
          <PanelButton
            label={PANEL_LABEL.list}
            count={profile.wishlist.length}
            active={openPanel === 'list'}
            tone="list"
            onClick={() => togglePanel('list')}
          />
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goMonth(addMonths(month, -1))}
            disabled={!canPrev}
            className="inline-flex size-12 items-center justify-center text-ink disabled:text-line"
            aria-label="Previous month"
          >
            <ChevronIcon className="size-6" />
          </button>
          <h1 className="font-display text-center text-2xl leading-8 font-extrabold tracking-tight sm:text-3xl">
            {month.toLocaleDateString('en-GB', { month: 'long' })}{' '}
            <span className="text-glow">{month.getFullYear()}</span>
          </h1>
          <button
            type="button"
            onClick={() => goMonth(addMonths(month, 1))}
            disabled={!canNext}
            className="inline-flex size-12 items-center justify-center text-ink disabled:text-line"
            aria-label="Next month"
          >
            <ChevronIcon className="size-6 rotate-180" />
          </button>
        </div>

        <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1">
          {months.map((item) => {
            const active = sameMonth(item, month)
            return (
              <button
                key={item.toISOString()}
                type="button"
                onClick={() => goMonth(item)}
                className={`min-h-10 shrink-0 px-4 text-sm ${active ? 'bg-ink text-indigo' : 'text-quiet hover:text-ink'}`}
              >
                {monthShort(item)}
              </button>
            )
          })}
        </div>

        <div className="mt-8 grid grid-cols-7">
          {WEEKDAYS.map((label, index) => (
            <p
              key={`${label}-${index}`}
              className="pb-3 text-center text-xs tracking-wide text-quiet uppercase"
            >
              {label}
            </p>
          ))}
          {cells.map((iso, index) => {
            if (!iso) return <div key={`empty-${index}`} />
            const mark = markDay(iso, profile.trips, classes)
            const on = iso === selected
            const isToday = iso === today
            const outside = !inSemester(iso, start, end)
            const planned = !mark.trip && pickDays.has(iso)
            const wash = mark.trip
              ? 'bg-beach text-indigo-deep'
              : planned
                ? 'bg-glow text-indigo-deep'
                : 'text-ink'
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelected(iso)}
                className={`flex aspect-square w-full items-center justify-center p-0.5 ${isToday && !on ? 'outline outline-1 outline-offset-[-1px] outline-quiet' : ''} ${outside ? 'opacity-35' : ''}`}
              >
                <span
                  className={`flex size-full flex-col items-center justify-center ${wash} ${on ? 'outline outline-2 outline-offset-[-2px] outline-ink' : ''}`}
                >
                  <span className="text-sm leading-none">{Number(iso.slice(8))}</span>
                  {!mark.trip && mark.classes.length > 0 && (
                    <span className="mt-1 block size-1 bg-class" />
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <section className="mt-10">
          <p className="text-xs tracking-[0.18em] text-quiet uppercase">
            {parseIso(selected).toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
            })}
          </p>

          <div className="mt-4 flex flex-col gap-5">
            {day.trip && (
              <article className="flex items-start gap-3">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center ${TRIP_WASH[day.trip.category]}`}
                >
                  <CategoryIcon category={day.trip.category} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg leading-7">{day.trip.destination}</h2>
                  <p className="text-sm text-quiet">
                    {formatRange(day.trip.startDate, day.trip.endDate)}
                  </p>
                </div>
              </article>
            )}

            {day.classes.map((session) => (
              <article key={`${session.title}-${session.startTime}`} className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center bg-class text-indigo-deep">
                  <BookIcon className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg leading-7">{session.title}</h2>
                  <p className="text-sm text-quiet">
                    {formatTime(session.startTime)}–{formatTime(session.endTime)}
                    {day.trip ? ' · overlaps a trip' : ''}
                  </p>
                </div>
              </article>
            ))}

            {pickForDay && !day.trip && (
              <article className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center bg-glow text-indigo-deep">
                  <CategoryIcon category={pickForDay.category} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs tracking-[0.16em] text-glow uppercase">Suggested</p>
                  <h2 className="text-lg leading-7">{pickForDay.destination}</h2>
                  <p className="text-sm text-quiet">
                    {suggestionWhen(pickForDay)} · {pickForDay.crowdNote}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-5">
                    <button
                      type="button"
                      className="min-h-12 text-ink hover:text-glow"
                      onClick={() => setLookingAt(pickForDay)}
                    >
                      Learn more
                    </button>
                    <button
                      type="button"
                      className="min-h-12 text-glow hover:text-ink"
                      onClick={() => lockIn(pickForDay)}
                    >
                      Add these dates
                    </button>
                  </div>
                </div>
              </article>
            )}

            {!day.trip && day.classes.length === 0 && !pickForDay && (
              <div>
                {inSemester(selected, start, end) ? (
                  <p className="text-quiet">
                    Open day.{' '}
                    <button
                      type="button"
                      className="text-glow hover:text-ink"
                      onClick={() => setOpenPanel('ideas')}
                    >
                      Where should I go
                    </button>
                  </p>
                ) : (
                  <p className="text-quiet">Outside this term.</p>
                )}
              </div>
            )}

            {!gcal && (
              <Link
                to="/connect"
                className="mt-2 inline-flex min-h-12 items-center gap-2 text-sm text-quiet no-underline hover:text-glow"
              >
                <CalendarIcon className="size-5" />
                Integrate Google Calendar
              </Link>
            )}
          </div>
        </section>
      </main>

      {lookingAt && (
        <PlaceSheet
          suggestion={lookingAt}
          onClose={() => setLookingAt(null)}
          onLock={() => lockIn(lookingAt)}
        />
      )}

      {openPanel && (
        <div className="fixed inset-0 z-30">
          <button
            type="button"
            className="absolute inset-0 bg-indigo-deep/70"
            aria-label="Close panel"
            onClick={() => setOpenPanel(null)}
          />
          <aside
            className={`absolute inset-y-0 flex w-[min(22rem,100vw)] flex-col bg-indigo ${openPanel === 'ideas' ? 'left-0 border-r border-line' : 'right-0 border-l border-line'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
          >
            <div className="flex items-center justify-between gap-3 px-5 pt-6">
              <h2
                id="panel-title"
                className={`text-base font-medium ${openPanel === 'ideas' ? 'text-glow' : 'text-ink'}`}
              >
                {PANEL_LABEL[openPanel]}
              </h2>
              <button
                type="button"
                className="min-h-12 px-1 text-quiet hover:text-ink"
                onClick={() => setOpenPanel(null)}
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-10">
              {openPanel === 'ideas' ? (
                <IdeasList picks={picks} onLock={lockIn} onLearn={setLookingAt} />
              ) : (
                <BucketList items={profile.wishlist} />
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

function PanelButton({
  label,
  count,
  active,
  tone,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  tone: PanelId
  onClick: () => void
}) {
  const on =
    tone === 'ideas'
      ? 'bg-glow text-indigo-deep'
      : 'bg-ink text-indigo'
  const off = tone === 'ideas' ? 'border border-line text-glow' : 'border border-line text-quiet'

  return (
    <button
      type="button"
      className={`min-h-12 px-3 text-sm leading-5 ${active ? on : off}`}
      aria-expanded={active}
      onClick={onClick}
    >
      {label}
      {count > 0 ? ` · ${count}` : ''}
    </button>
  )
}

function IdeasList({
  picks,
  onLock,
  onLearn,
}: {
  picks: TimedSuggestion[]
  onLock: (item: TimedSuggestion) => void
  onLearn: (item: TimedSuggestion) => void
}) {
  if (picks.length === 0) {
    return <p className="text-sm leading-6 text-quiet">No quieter week fits the open dates right now.</p>
  }

  return (
    <>
      <p className="text-sm leading-6 text-quiet">
        From your tastes, in a quieter week that still fits your open dates.
      </p>
      <ul className="mt-6 flex flex-col gap-8">
        {picks.map((item) => (
          <li key={`${item.destination}-${item.startDate}`}>
            <article>
              <div className="flex items-start gap-3">
                <CategoryIcon category={item.category} className="mt-1 size-5 shrink-0 text-glow" />
                <div className="min-w-0">
                  <h3 className="text-lg leading-7">{item.destination}</h3>
                  <p className="text-base text-ink">{suggestionWhen(item)}</p>
                  <p className="mt-1 text-sm text-quiet">{item.crowdNote}</p>
                  <p className="text-sm text-quiet">{item.seasonNote}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-5">
                <button
                  type="button"
                  className="min-h-12 text-ink hover:text-glow"
                  onClick={() => onLearn(item)}
                >
                  Learn more
                </button>
                <button
                  type="button"
                  className="min-h-12 text-glow hover:text-ink"
                  onClick={() => onLock(item)}
                >
                  Add these dates
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </>
  )
}

function BucketList({ items }: { items: WishlistItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm leading-6 text-quiet">
        Nothing saved.{' '}
        <Link to="/setup" className="text-glow no-underline hover:text-ink">
          Add a place
        </Link>
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-6">
      {items.map((item) => (
        <li key={item.destination} className="flex items-start gap-3">
          <CategoryIcon category={item.category} className="mt-1 size-5 shrink-0 text-glow" />
          <div>
            <p className="text-lg leading-7">{item.destination}</p>
            <p className="text-sm text-quiet">{item.reason}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function PlaceSheet({
  suggestion,
  onClose,
  onLock,
}: {
  suggestion: TimedSuggestion
  onClose: () => void
  onLock: () => void
}) {
  const guide = placeGuide(suggestion.destination)

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        className="absolute inset-0 bg-indigo-deep/70"
        aria-label="Close place details"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-4 top-[10vh] mx-auto max-h-[80dvh] w-full max-w-md overflow-y-auto border border-line bg-indigo px-5 pt-6 pb-8 sm:inset-x-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center bg-glow text-indigo-deep">
              <CategoryIcon category={suggestion.category} className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs tracking-[0.16em] text-glow uppercase">
                {CATEGORY_LABEL[suggestion.category]}
              </p>
              <h2 id="place-title" className="text-xl leading-7">
                {suggestion.destination}
              </h2>
              <p className="mt-1 text-sm text-quiet">{suggestionWhen(suggestion)}</p>
            </div>
          </div>
          <button type="button" className="min-h-12 shrink-0 px-1 text-quiet hover:text-ink" onClick={onClose}>
            Close
          </button>
        </div>

        <p className="mt-6 text-base leading-7 text-ink">{guide?.reason ?? suggestion.reason}</p>
        {guide && <p className="mt-4 text-sm leading-6 text-quiet">{guide.about}</p>}

        {guide && guide.highlights.length > 0 && (
          <div className="mt-6">
            <p className="text-xs tracking-[0.16em] text-quiet uppercase">Do this</p>
            <ul className="mt-3 flex flex-col gap-2">
              {guide.highlights.map((item) => (
                <li key={item} className="text-sm leading-6 text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {guide && (
          <div className="mt-6">
            <p className="text-xs tracking-[0.16em] text-quiet uppercase">Getting there</p>
            <p className="mt-2 text-sm leading-6 text-ink">{guide.travel}</p>
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs tracking-[0.16em] text-quiet uppercase">Why this window</p>
          <p className="mt-2 text-sm leading-6 text-ink">{suggestion.seasonNote}</p>
          <p className="mt-1 text-sm leading-6 text-quiet">{suggestion.crowdNote}</p>
        </div>

        <button type="button" className="ui-btn mt-8" onClick={onLock}>
          Add these dates
        </button>
      </div>
    </div>
  )
}
