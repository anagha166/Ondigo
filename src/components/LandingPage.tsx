import { Link } from 'react-router-dom'
import { isProfileReady, loadProfile, loadUser } from '../lib/profile'
import { Wordmark } from './Wordmark'

const PREVIEW = [
  { day: '2', tone: 'bg-beach' },
  { day: '3', tone: 'bg-beach' },
  { day: '4', tone: 'bg-glow' },
  { day: '5', tone: 'bg-glow' },
  { day: '6', tone: 'bg-indigo-mid' },
  { day: '7', tone: 'bg-indigo-mid' },
  { day: '8', tone: 'bg-indigo-mid' },
]

export function LandingPage() {
  const user = loadUser()
  const ready = isProfileReady(loadProfile())

  return (
    <div className="min-h-dvh bg-indigo text-ink antialiased">
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-5 text-center">
        <p className="text-sm tracking-[0.22em] text-glow uppercase">For Students Abroad</p>
        <h1 className="sr-only">Ondigo</h1>
        <div className="mt-6">
          <Wordmark size="xl" />
        </div>
        <p className="mt-8 max-w-md text-xl leading-8 text-ink">
          We help you plan your abroad, so you can focus on the studying too :p
        </p>

        <div className="mt-10" aria-hidden>
          <div className="grid grid-cols-7 justify-items-center gap-2">
            {PREVIEW.map((cell, index) => (
              <div
                key={`${cell.day}-${index}`}
                className={`flex size-10 items-center justify-center text-sm font-medium ${cell.tone} ${cell.tone === 'bg-indigo-mid' ? 'text-quiet' : 'text-indigo-deep'}`}
              >
                {cell.day}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-quiet">Booked in orange. Planned in lilac. Free days stay indigo.</p>
        </div>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          {user && ready ? (
            <Link to="/calendar" className="ui-btn no-underline">
              Open your calendar
            </Link>
          ) : (
            <Link to="/login" className="ui-btn no-underline">
              Get started
            </Link>
          )}
          {user && !ready && (
            <Link to="/setup" className="ui-btn-ghost no-underline">
              Finish setup
            </Link>
          )}
          {!user && (
            <Link to="/login" className="ui-btn-ghost no-underline">
              Log in
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
