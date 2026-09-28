import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CLASS_TEMPLATES } from '../data/semester'
import { mergeClassTemplates, setGcalConnected } from '../lib/calendar'
import { loadProfile, saveProfile } from '../lib/profile'
import { Wordmark } from './Wordmark'

const STEPS = [
  'Finding your classes…',
  'Lining them up with your trips…',
  'Marking the open weekends…',
]

export function IntegratingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const doneAt = reduceMotion ? 400 : 2300
    const stepAt = reduceMotion ? 80 : 700
    const stepTimer = window.setInterval(() => {
      setStep((current) => Math.min(current + 1, STEPS.length - 1))
    }, stepAt)
    const doneTimer = window.setTimeout(() => {
      setGcalConnected()
      const profile = loadProfile()
      if (profile) {
        saveProfile({
          ...profile,
          classes: mergeClassTemplates(profile.classes, CLASS_TEMPLATES),
        })
      }
      navigate('/calendar', { replace: true })
    }, doneAt)
    return () => {
      window.clearInterval(stepTimer)
      window.clearTimeout(doneTimer)
    }
  }, [navigate, reduceMotion])

  return (
    <div className="flex min-h-dvh flex-col bg-indigo px-5 pt-16 pb-12 text-ink antialiased">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <Wordmark size="md" />
        <h1 className="mt-16 font-display text-4xl leading-10 font-extrabold tracking-tight">
          Integrating Google Calendar
        </h1>
        <p className="mt-4 text-lg leading-8 text-quiet" aria-live="polite">
          {STEPS[step]}
        </p>

        <div className="mt-10 h-1 w-full bg-indigo-mid">
          <div className="ondigo-bar h-full bg-glow" />
        </div>

        <ul className="mt-12 flex flex-col gap-3 text-quiet">
          {CLASS_TEMPLATES.map((item) => (
            <li key={item.title} className="ondigo-pulse text-base">
              {item.title}
              <span className="text-glow">
                {' '}
                · {item.startTime}–{item.endTime}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
