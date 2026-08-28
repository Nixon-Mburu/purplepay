import { useState } from 'react'
import { loginUser, logoutUser, registerUser } from './services/auth'

function App() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('Nixon')
  const [email, setEmail] = useState('nixon@example.com')
  const [password, setPassword] = useState('password123')
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data =
        mode === 'register'
          ? await registerUser({ name, email, password })
          : await loginUser({ email, password })
      localStorage.setItem('purplepay_token', data.token)
      localStorage.setItem('purplepay_user', JSON.stringify(data.user))
      setSession(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    const token = session?.token || localStorage.getItem('purplepay_token')
    if (token) await logoutUser(token).catch(() => null)
    localStorage.removeItem('purplepay_token')
    localStorage.removeItem('purplepay_user')
    setSession(null)
  }

  return (
    <main className="app-page auth-page">
      <nav className="topbar">
        <a href="/">PurplePay</a>
        <span>Account</span>
      </nav>

      <section className="hero">
        <span>Welcome back</span>
        <h1>Your money, orders, and receipts in one account.</h1>
        <p>Sign in to continue, or create an account in a few seconds.</p>
      </section>

      <section className="auth-layout">
        <form className="panel" onSubmit={submit}>
          <div className="mode-switch">
            <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>
              Sign In
            </button>
            <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => setMode('register')}>
              Register
            </button>
          </div>
          {mode === 'register' && (
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          )}
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button disabled={isLoading} type="submit">
            {isLoading ? 'Working...' : mode === 'register' ? 'Create Account' : 'Sign In'}
          </button>
          {session && (
            <button className="secondary" type="button" onClick={signOut}>
              Sign Out
            </button>
          )}
        </form>

        <aside className="account-card">
          <span>{session ? 'Signed in as' : 'Account status'}</span>
          <strong>{session?.user?.name || 'Signed out'}</strong>
          <p>
            {session
              ? 'You can now create orders, make payments, and review wallet activity.'
              : 'Use the form to access your PurplePay workspace.'}
          </p>
          {session?.user?.email && <small>{session.user.email}</small>}
        </aside>
      </section>
    </main>
  )
}

export default App
