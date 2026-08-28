import '../styles/DashboardPage.css'

function DashboardPage({
  activity,
  orders,
  payments,
  user,
  walletBalance,
  onNavigate,
}) {
  const unpaidOrders = orders.filter((order) => order.status !== 'Paid')

  return (
    <section className="page dashboard-page">
      <div className="home-hero">
        <div>
          <span className="soft-label">Checkout workspace</span>
          <h1>{user ? `Welcome back, ${user.name}.` : 'Your payment day starts here.'}</h1>
          <p>
            Create orders, pay merchants, review wallet movement, and watch the
            full checkout journey from one clean workspace.
          </p>
          <div className="hero-actions">
            <button type="button" onClick={() => onNavigate('payments')}>
              Make a Payment
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onNavigate('orders')}
            >
              Create Order
            </button>
          </div>
        </div>

        <div className="balance-panel">
          <span>Available balance</span>
          <strong>${walletBalance.toFixed(2)}</strong>
          <p>{unpaidOrders.length} order awaiting payment</p>
        </div>
      </div>

      <div className="dashboard-summary">
        <article>
          <span>Orders</span>
          <strong>{orders.length}</strong>
          <p>{unpaidOrders.length} ready to pay</p>
        </article>
        <article>
          <span>Payments</span>
          <strong>{payments.length}</strong>
          <p>Completed payments</p>
        </article>
        <article>
          <span>Activity</span>
          <strong>{activity.length}</strong>
          <p>Recent lifecycle events</p>
        </article>
      </div>

      <div className="activity-preview">
        <h2>Latest activity</h2>
        {activity.slice(0, 3).map((item) => (
          <article key={`${item.title}-${item.time}`}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <span>{item.time}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DashboardPage
