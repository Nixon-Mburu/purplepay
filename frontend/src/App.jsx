import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import OrdersPage from './pages/OrdersPage'
import PaymentsPage from './pages/PaymentsPage'
import WalletPage from './pages/WalletPage'
import WebhooksPage from './pages/WebhooksPage'
import { getCurrentUser, logoutUser } from './services/auth'

const pages = [
  { path: 'dashboard', label: 'Home' },
  { path: 'auth', label: 'Sign in' },
  { path: 'orders', label: 'Orders' },
  { path: 'payments', label: 'Pay' },
  { path: 'wallet', label: 'Wallet' },
  { path: 'webhooks', label: 'Activity' },
]

function getCurrentPage() {
  return window.location.hash.replace('#/', '') || 'dashboard'
}

const initialOrders = [
  {
    id: 'ORD-2048',
    merchant: 'Northline Grocers',
    description: 'Weekly grocery basket',
    amount: 84.5,
    status: 'Ready to pay',
  },
  {
    id: 'ORD-2049',
    merchant: 'CloudBox Storage',
    description: 'Team storage subscription',
    amount: 19,
    status: 'Paid',
  },
]

const initialPayments = [
  {
    id: 'PAY-8831',
    orderId: 'ORD-2049',
    merchant: 'CloudBox Storage',
    amount: 19,
    status: 'Successful',
  },
]

const initialActivity = [
  {
    title: 'Payment received',
    detail: 'CloudBox Storage payment was confirmed.',
    time: 'Today, 09:12',
  },
  {
    title: 'Order created',
    detail: 'Northline Grocers is waiting for payment.',
    time: 'Today, 08:45',
  },
]

function App() {
  const [currentPage, setCurrentPage] = useState(getCurrentPage)
  const [user, setUser] = useState(null)
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem('purplepay_token'),
  )
  const [orders, setOrders] = useState(initialOrders)
  const [payments, setPayments] = useState(initialPayments)
  const [activity, setActivity] = useState(initialActivity)
  const [walletBalance, setWalletBalance] = useState(426.75)
  const activePage = pages.some((page) => page.path === currentPage)
    ? currentPage
    : 'dashboard'

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(getCurrentPage())

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (!authToken) return

    getCurrentUser(authToken)
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('purplepay_token')
        setAuthToken(null)
      })
  }, [authToken])

  const navigate = (page) => {
    window.location.hash = `#/${page}`
    setCurrentPage(page)
  }

  const addActivity = (title, detail) => {
    setActivity((items) => [
      {
        title,
        detail,
        time: 'Just now',
      },
      ...items,
    ])
  }

  const handleAuthSuccess = ({ token, user: profile }) => {
    localStorage.setItem('purplepay_token', token)
    setAuthToken(token)
    setUser(profile)
    addActivity('Welcome back', `${profile.name} signed in successfully.`)
    navigate('dashboard')
  }

  const handleSignOut = async () => {
    if (authToken) {
      await logoutUser(authToken).catch(() => null)
    }

    localStorage.removeItem('purplepay_token')
    setAuthToken(null)
    setUser(null)
    addActivity('Signed out', 'The current account session ended.')
    navigate('auth')
  }

  const handleCreateOrder = (order) => {
    setOrders((items) => [order, ...items])
    addActivity('Order created', `${order.merchant} is ready for payment.`)
    navigate('payments')
  }

  const handlePay = ({ orderId, amount, merchant }) => {
    const payment = {
      id: `PAY-${Math.floor(Math.random() * 9000) + 1000}`,
      orderId,
      merchant,
      amount,
      status: 'Successful',
    }

    setPayments((items) => [payment, ...items])
    setOrders((items) =>
      items.map((order) =>
        order.id === orderId ? { ...order, status: 'Paid' } : order,
      ),
    )
    setWalletBalance((balance) => Number((balance - amount).toFixed(2)))
    addActivity('Payment successful', `${merchant} received $${amount}.`)
    navigate('wallet')
  }

  const pageComponents = {
    dashboard: (
      <DashboardPage
        activity={activity}
        orders={orders}
        payments={payments}
        user={user}
        walletBalance={walletBalance}
        onNavigate={navigate}
      />
    ),
    auth: (
      <AuthPage
        user={user}
        authToken={authToken}
        onAuthSuccess={handleAuthSuccess}
        onSignOut={handleSignOut}
      />
    ),
    orders: <OrdersPage orders={orders} onCreateOrder={handleCreateOrder} />,
    payments: <PaymentsPage orders={orders} onPay={handlePay} />,
    wallet: <WalletPage payments={payments} walletBalance={walletBalance} />,
    webhooks: <WebhooksPage activity={activity} payments={payments} />,
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <a className="brand-mark" href="#/dashboard" aria-label="PurplePay home">
            PP
          </a>
          <div>
            <strong>PurplePay</strong>
            <span>Simple checkout for small teams</span>
          </div>
        </div>

        <nav className="app-nav" aria-label="Application pages">
          {pages.map((page) => (
            <a
              className={page.path === activePage ? 'active' : ''}
              href={`#/${page.path}`}
              key={page.path}
            >
              {page.label}
            </a>
          ))}
        </nav>

        <div className="account-pill">
          <span>{user ? user.name : 'Guest account'}</span>
          <strong>${walletBalance.toFixed(2)}</strong>
        </div>
      </header>

      <div className="page-frame">{pageComponents[activePage]}</div>
    </main>
  )
}

export default App
