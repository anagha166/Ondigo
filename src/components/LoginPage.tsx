import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isProfileReady, loadProfile, saveUser } from '../lib/profile'
import { Wordmark } from './Wordmark'

export function LoginPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName || !trimmedEmail) return
    saveUser({ name: trimmedName, email: trimmedEmail })
    navigate(isProfileReady(loadProfile()) ? '/calendar' : '/setup')
  }

  return (
    <div className="min-h-dvh bg-indigo text-ink antialiased">
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pt-16 pb-12">
        <Link to="/" className="no-underline text-ink">
          <Wordmark size="md" />
        </Link>
        <h1 className="mt-16 font-display text-4xl leading-10 font-extrabold tracking-tight">
          Come on in.
        </h1>
        <p className="mt-4 text-lg leading-8 text-quiet">
          Name and email. That’s enough for now — no password theater.
        </p>

        <form onSubmit={submit} className="mt-12 flex flex-col gap-8">
          <label className="block">
            <span className="text-xs tracking-[0.16em] text-quiet uppercase">First name</span>
            <input
              className="ui-field"
              name="name"
              autoComplete="given-name"
              placeholder="Maya"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs tracking-[0.16em] text-quiet uppercase">Email</span>
            <input
              className="ui-field"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="maya@school.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="ui-btn mt-4">
            Continue
          </button>
        </form>
      </main>
    </div>
  )
}
