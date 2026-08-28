const apps = [
  {
    name: 'Account',
    url: 'http://localhost:3001',
    description: 'Sign in, create an account, and manage your session.',
  },
  {
    name: 'Orders',
    url: 'http://localhost:3002',
    description: 'Create payment requests before checkout.',
  },
  {
    name: 'Pay',
    url: 'http://localhost:3003',
    description: 'Choose an order and complete payment.',
  },
  {
    name: 'Wallet',
    url: 'http://localhost:3004',
    description: 'Track balance and payment history.',
  },
  {
    name: 'Activity',
    url: 'http://localhost:3005',
    description: 'Review confirmations and recent updates.',
  },
]

function App() {
  return (
    <main className="shell-page">
      <nav className="topbar">
        <a className="brand" href="/">
          PurplePay
        </a>
        <a className="topbar-action" href="http://localhost:3001">
          Sign in
        </a>
      </nav>

      <section className="shell-hero">
        <div className="hero-copy">
          <span className="soft-label">Fast payments</span>
          <h1>Send, receive, and track payments without the noise.</h1>
          <p>
            PurplePay gives small teams one calm place to prepare orders, pay
            merchants, and follow every confirmation.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="http://localhost:3003">
              Make a Payment
            </a>
            <a className="secondary-link" href="http://localhost:3002">
              Create Order
            </a>
          </div>
        </div>

        <div className="hero-card">
          <span>Available balance</span>
          <strong>$426.75</strong>
          <p>2 recent payments confirmed</p>
        </div>
      </section>

      <section className="app-grid" aria-label="PurplePay sections">
        {apps.map((app) => (
          <a href={app.url} key={app.name}>
            <strong>{app.name}</strong>
            <p>{app.description}</p>
            <span>Open</span>
          </a>
        ))}
      </section>
    </main>
  )
}

export default App
