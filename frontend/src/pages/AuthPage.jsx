import { useState } from 'react'
import { loginUser, registerUser } from '../services/auth'
import '../styles/AuthPage.css'

function AuthPage({ user, authToken, onAuthSuccess, onSignOut }) {
  const [name, setName] = useState('Nixon')
  const [email, setEmail] = useState('nixon@example.com')
  const [password, setPassword] = useState('password123')
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data =
        mode === 'register'
          ? await registerUser({ name, email, password })
          : await loginUser({ email, password })

      onAuthSuccess(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="page auth-page">
      <div className="auth-copy">
        <span className="soft-label">Secure demo account</span>
        <h1>Pay, track, and manage every checkout in one place.</h1>
        <p>
          Sign in to the demo wallet and walk through the customer payment flow.
          Your session keeps orders, payments, and wallet activity together.
        </p>
      </div>

      <div className="auth-layout">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>{mode === 'register' ? 'Create account' : 'Welcome back'}</h2>
          <div className="auth-mode-switch">
            <button
              className={mode === 'login' ? 'active' : 'secondary-button'}
              onClick={() => setMode('login')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={mode === 'register' ? 'active' : 'secondary-button'}
              onClick={() => setMode('register')}
              type="button"
            >
              Register
            </button>
          </div>

          <label>
            Name
            <input
              disabled={mode === 'login'}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              type="text"
              value={name}
            />
          </label>
          <label>
            Email
            <input
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </label>
          <label>
            Password
            <input
              onChange={(event) => setPassword(event.target.value)}
              placeholder="demo password"
              type="password"
              value={password}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <div className="button-row">
            <button disabled={isLoading} type="submit">
              {isLoading
                ? 'Working...'
                : mode === 'register'
                  ? 'Create Account'
                  : 'Sign In'}
            </button>
            {user && (
              <button type="button" className="secondary-button" onClick={onSignOut}>
                Sign Out
              </button>
            )}
          </div>
        </form>

        <aside className="auth-session">
          <span>{user ? 'Signed in as' : 'No active session'}</span>
          <strong>{user ? user.name : 'Guest'}</strong>
          <p>{user ? user.email : 'Use the form to start the demo flow.'}</p>
          <code>{authToken ? `${authToken.slice(0, 18)}...` : 'access_token.pending'}</code>
        </aside>
      </div>
    </section>
  )
}

export default AuthPage
