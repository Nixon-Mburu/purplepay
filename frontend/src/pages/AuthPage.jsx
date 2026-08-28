import { useState } from 'react'
import '../styles/AuthPage.css'

function AuthPage({ user, onSignIn, onSignOut }) {
  const [name, setName] = useState('Nixon')
  const [email, setEmail] = useState('nixon@example.com')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSignIn({ name, email })
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
          <h2>{user ? 'Your session' : 'Welcome back'}</h2>
          <label>
            Name
            <input
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
            <input type="password" placeholder="demo password" />
          </label>

          <div className="button-row">
            <button type="submit">{user ? 'Refresh Session' : 'Sign In'}</button>
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
          <code>{user ? 'access_token.demo.active' : 'access_token.pending'}</code>
        </aside>
      </div>
    </section>
  )
}

export default AuthPage
