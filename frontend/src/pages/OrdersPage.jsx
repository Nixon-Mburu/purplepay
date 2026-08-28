import { useState } from 'react'
import { createOrder } from '../services/order/order'
import '../styles/OrdersPage.css'

function OrdersPage({ authToken, orders, user, onCreateOrder }) {
  const [merchant, setMerchant] = useState('Kilimani Coffee')
  const [description, setDescription] = useState('Team breakfast order')
  const [amount, setAmount] = useState('32.50')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const data = await createOrder({
        amount: Number(amount || 0),
        description,
        merchant,
        token: authToken,
        userId: user?.id,
      })

      onCreateOrder(data.order)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="page orders-page">
      <div className="page-hero">
        <span className="soft-label">Orders</span>
        <h1>Create an order before checkout.</h1>
        <p>
          Add a merchant, describe the purchase, and send the order into
          checkout when it is ready.
        </p>
      </div>

      <form className="order-form" onSubmit={handleSubmit}>
        <label>
          Merchant
          <input
            onChange={(event) => setMerchant(event.target.value)}
            value={merchant}
          />
        </label>
        <label>
          Description
          <input
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        </label>
        <label>
          Amount
          <input
            min="1"
            onChange={(event) => setAmount(event.target.value)}
            step="0.01"
            type="number"
            value={amount}
          />
        </label>
        <button disabled={isSaving} type="submit">
          {isSaving ? 'Saving...' : 'Save Order'}
        </button>
      </form>

      {error && <p className="order-error">{error}</p>}

      <div className="orders-list">
        {orders.map((order) => (
          <article className="order-row" key={order.id}>
            <div>
              <strong>{order.merchant}</strong>
              <p>{order.description}</p>
            </div>
            <span>{order.id}</span>
            <strong>${order.amount.toFixed(2)}</strong>
            <em>{order.status}</em>
          </article>
        ))}
      </div>
    </section>
  )
}

export default OrdersPage
