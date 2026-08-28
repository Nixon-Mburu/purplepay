import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function App() {
  const [events, setEvents] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/activity`)
      .then((response) => response.json())
      .then((data) => setEvents(data.events || []))
      .catch((requestError) => setError(requestError.message))
  }, [])

  return (
    <main className="page">
      <header>
        <a href="http://localhost:3000">PurplePay</a>
        <span>Activity</span>
      </header>
      <section className="hero">
        <h1>Your latest updates.</h1>
        <p>Payment confirmations, account changes, and important notices live here.</p>
      </section>
      {error && <p className="error">{error}</p>}
      <section className="list">
        {events.length === 0 && (
          <article>
            <div>
              <strong>No activity yet</strong>
              <p>Your confirmations will appear here.</p>
            </div>
            <span>Today</span>
          </article>
        )}
        {events.map((event) => (
          <article key={event.id}>
            <div>
              <strong>{event.event_type}</strong>
              <p>{event.payload?.merchant || event.provider}</p>
            </div>
            <span>{event.received_at}</span>
          </article>
        ))}
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
