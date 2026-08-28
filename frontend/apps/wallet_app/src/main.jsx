import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function App() {
  const [wallet, setWallet] = useState(null)
  const [ledger, setLedger] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/wallet/demo-user`)
      .then((response) => response.json())
      .then((data) => { setWallet(data.wallet); setLedger(data.ledger || []) })
      .catch((requestError) => setError(requestError.message))
  }, [])

  return (
    <main className="page">
      <header>
        <a href="http://localhost:3000">PurplePay</a>
        <span>Wallet</span>
      </header>
      <section className="hero">
        <h1>Your balance at a glance.</h1>
        <p>See what is available and where your money went.</p>
      </section>
      {error && <p className="error">{error}</p>}
      <section className="balance">
        <span>Available balance</span>
        <strong>${Number(wallet?.balance || 0).toFixed(2)}</strong>
      </section>
      <section className="list">
        {ledger.length === 0 && (
          <article>
            <div>
              <strong>No spending yet</strong>
              <p>Your payments will appear here.</p>
            </div>
            <span>$0.00</span>
          </article>
        )}
        {ledger.map((entry) => (
          <article key={entry.id}>
            <div>
              <strong>{entry.description}</strong>
              <p>{entry.payment_id}</p>
            </div>
            <span>${Number(entry.amount).toFixed(2)}</span>
          </article>
        ))}
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
