import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import OrdersPage from './pages/OrdersPage'
import PaymentsPage from './pages/PaymentsPage'
import WalletPage from './pages/WalletPage'
import WebhooksPage from './pages/WebhooksPage'
import { listActivity } from './services/activity/activity'
import { getCurrentUser, logoutUser } from './services/auth'
import { listOrders } from './services/order/order'
import { listPayments } from './services/payment/payment'
import { getWallet } from './services/wallet/wallet'

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

  useEffect(() => {
    if (!user || !authToken) return

    listOrders({ userId: user.id, token: authToken })
      .then((data) => {
        if (data.orders.length > 0) {
          setOrders(data.orders)
        }
      })
      .catch(() => null)

    listPayments({ userId: user.id, token: authToken })
      .then((data) => {
        if (data.payments.length > 0) {
          setPayments(data.payments)
        }
      })
      .catch(() => null)

    getWallet({ userId: user.id, token: authToken })
      .then((data) => {
        setWalletBalance(data.wallet.balance)
      })
      .catch(() => null)

    listActivity()
      .then((data) => {
        if (data.events.length > 0) {
          setActivity(
            data.events.map((event) => ({
              title: event.event_type,
              detail:
                event.payload?.merchant ||
                event.payload?.description ||
                'Account activity was recorded.',
              time: event.received_at,
            })),
          )
        }
      })
      .catch(() => null)
  }, [authToken, user])

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

  const handlePay = (payment) => {
    setPayments((items) => [payment, ...items])
    setOrders((items) =>
      items.map((order) =>
        order.id === payment.orderId ? { ...order, status: 'Paid' } : order,
      ),
    )
    setWalletBalance((balance) => Number((balance - payment.amount).toFixed(2)))
    addActivity(
      'Payment successful',
      `${payment.merchant} received $${payment.amount}.`,
    )
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
    orders: (
      <OrdersPage
        authToken={authToken}
        orders={orders}
        user={user}
        onCreateOrder={handleCreateOrder}
      />
    ),
    payments: (
      <PaymentsPage
        authToken={authToken}
        orders={orders}
        user={user}
        onPay={handlePay}
      />
    ),
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
