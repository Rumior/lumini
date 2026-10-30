
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { LockKeyhole, Mail, ArrowRight, LoaderCircle } from 'lucide-react'
import './auth.css'

type Props = {
  children: ReactNode
}

export default function AuthGate({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let alive = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (alive) {
        setSession(nextSession)
        setChecking(false)
      }
    })

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return

      if (sessionError) {
        setError('Unable to check your session. Please refresh and try again.')
      }

      setSession(data.session)
      setChecking(false)
    })

    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)

    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })

        if (authError) throw authError

        if (data.session) {
          setSession(data.session)
        } else {
          setMessage('Check your email for a confirmation link to activate your account.')
        }
      } else {
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })

        if (authError) throw authError
        setSession(data.session)
      }
    } catch (err) {
  const errorMessage =
    err instanceof Error
      ? err.message
      : 'Authentication failed. Please try again.'

  if (errorMessage.toLowerCase().includes('rate limit')) {
    setError(
      'Too many account creation or confirmation email requests. Please wait before trying again. If this continues, check your Supabase email rate limits.'
    )
  } else {
    setError(errorMessage)
  }
} finally {
  setBusy(false)
}
  }

  async function handleGoogleSignIn() {
    setError('')
    setMessage('')
    setBusy(true)

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })

      if (authError) throw authError
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Google sign-in could not be started.'
      )
      setBusy(false)
    }
  }

  async function handleSignOut() {
    setError('')
    const { error: authError } = await supabase.auth.signOut()

    if (authError) {
      setError(authError.message)
    }
  }

  if (checking) {
    return (
      <div className="lumini-auth-loading">
        <LoaderCircle className="lumini-auth-spinner" size={28} />
        <span>Loading Luminiâ€¦</span>
      </div>
    )
  }

  if (session) {
    return (
      <>
        {children}
        <button
          className="lumini-signout"
          onClick={handleSignOut}
          type="button"
          title={`Signed in as ${session.user.email ?? 'user'}`}
        >
          Logout
        </button>
      </>
    )
  }

  return (
    <main className="lumini-auth">
      <section className="lumini-auth-card">
        <div className="lumini-auth-brand">
          <span className="lumini-auth-mark">L</span>
          <div>
            <strong>Lumini</strong>
            <span>BUSINESS MENTOR</span>
          </div>
        </div>

        <div className="lumini-auth-intro">
          <p className="lumini-auth-eyebrow">YOUR BUSINESS, WITH CLARITY</p>
          <h1>
            {mode === 'signin'
              ? 'Welcome back.'
              : 'Create your account.'}
          </h1>
          <p>
            {mode === 'signin'
              ? 'Sign in to continue to your business workspace.'
              : 'Set up your account to get started with Lumini.'}
          </p>
        </div>

        <button
          className="lumini-google-button"
          type="button"
          disabled={busy}
          onClick={handleGoogleSignIn}
        >
          <svg viewBox="0 0 48 48" width="19" height="19" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.99 46.98 31.8 46.98 24.55Z" />
            <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.9 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
          </svg>
          Continue with Google
        </button>

        <div className="lumini-auth-divider">
          <span>or continue with email</span>
        </div>

        <form className="lumini-auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <span className="lumini-auth-input">
              <Mail size={17} />
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </span>
          </label>

          <label>
            Password
            <span className="lumini-auth-input">
              <LockKeyhole size={17} />
              <input
                type="password"
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                placeholder="At least 8 characters"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </span>
          </label>

          {error && (
            <p className="lumini-auth-error" role="alert">{error}</p>
          )}

          {message && (
            <p className="lumini-auth-message" role="status">{message}</p>
          )}

          <button
            className="lumini-auth-submit"
            type="submit"
            disabled={busy}
          >
            {busy
              ? 'Please waitâ€¦'
              : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
            {!busy && <ArrowRight size={17} />}
          </button>
        </form>

        <p className="lumini-auth-switch">
          {mode === 'signin'
            ? "Don't have an account?"
            : 'Already have an account?'}
          {' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError('')
              setMessage('')
            }}
          >
            {mode === 'signin' ? 'Create account' : 'Sign in'}
          </button>
        </p>

        <p className="lumini-auth-security">
          Your account is protected by Supabase authentication.
        </p>
      </section>
    </main>
  )
}

