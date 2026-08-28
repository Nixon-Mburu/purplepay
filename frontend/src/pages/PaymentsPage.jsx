import { useMemo, useState } from 'react'
import { createPayment } from '../services/payment/payment'
import '../styles/PaymentsPage.css'

function PaymentsPage({ authToken, orders, user, onPay }) {
  const payableOrders = useMemo(
    () => orders.filter((order) => order.status !== 'Paid'),
    [orders],
  )
  const firstOrder = payableOrders[0] || orders[0]
  const [selectedOrderId, setSelectedOrderId] = useState(firstOrder?.id || '')
  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) || firstOrder
  const [error, setError] = useState('')
  const [isPaying, setIsPaying] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedOrder) return

    setError('')
    setIsPaying(true)

    try {
      const data = await createPayment({
        order: {
          ...selectedOrder,
          user_id: selectedOrder.user_id || user?.id || 'demo-user',
        },
        token: authToken,
      })

      onPay(data.payment)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <section className="page payments-page">
      <div className="page-hero">
        <span className="soft-label">Checkout</span>
        <h1>Pay a merchant securely.</h1>
        <p>
          Choose an unpaid order, confirm the amount, and simulate a successful
          payment with a saved card or wallet balance.
        </p>
      </div>

      <div className="payment-layout">
        <form className="payment-form" onSubmit={handleSubmit}>
          <label>
            Order
            <select
              onChange={(event) => setSelectedOrderId(event.target.value)}
              value={selectedOrderId}
            >
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.merchant} - {order.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Amount
            <input
              readOnly
              type="text"
              value={selectedOrder ? `$${selectedOrder.amount.toFixed(2)}` : '$0.00'}
            />
          </label>
          <label>
            Pay with
            <select defaultValue="USD">
              <option>Visa ending 4242</option>
              <option>Wallet balance</option>
              <option>Bank transfer</option>
            </select>
          </label>
          <label>
            Idempotency Key
            <input readOnly type="text" value="demo-key-001" />
          </label>
          {error && <p className="payment-error">{error}</p>}

          <button disabled={!selectedOrder || isPaying} type="submit">
            {isPaying ? 'Paying...' : 'Pay Now'}
          </button>
        </form>

        <aside className="payment-status">
          <span>Selected checkout</span>
          <strong>{selectedOrder ? selectedOrder.merchant : 'No order'}</strong>
          <p>
            {selectedOrder
              ? `${selectedOrder.description} for $${selectedOrder.amount.toFixed(2)}`
              : 'Create an order first to unlock checkout.'}
          </p>
        </aside>
      </div>
    </section>
  )
}

export default PaymentsPage
