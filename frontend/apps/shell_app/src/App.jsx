const apps = [
  {
    name: 'Account',
    url: '/auth/',
    description: 'Sign in, create an account, and manage your session.',
  },
  {
    name: 'Orders',
    url: '/orders/',
    description: 'Create payment requests before checkout.',
  },
  {
    name: 'Pay',
    url: '/pay/',
    description: 'Choose an order and complete payment.',
  },
  {
    name: 'Wallet',
    url: '/wallet/',
    description: 'Track balance and payment history.',
  },
  {
    name: 'Activity',
    url: '/activity/',
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
        <a className="topbar-action" href="/auth/">
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
            <a className="primary-link" href="/pay/">
              Make a Payment
            </a>
            <a className="secondary-link" href="/orders/">
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
