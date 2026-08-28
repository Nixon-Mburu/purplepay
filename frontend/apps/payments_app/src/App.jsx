import { useEffect, useMemo, useState } from 'react'
import { createPayment, listOrders } from './services/payments'

function App() {
  const [orders, setOrders] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState('')
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedId) || orders[0],
    [orders, selectedId],
  )

  useEffect(() => {
    listOrders()
      .then((data) => {
        setOrders(data.orders)
        setSelectedId(data.orders[0]?.id || '')
      })
      .catch((requestError) => setError(requestError.message))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    if (!selectedOrder) return
    setError('')
    try {
      const data = await createPayment(selectedOrder)
      setPayment(data.payment)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="page">
      <header>
        <a href="http://localhost:3000">PurplePay</a>
        <span>Pay</span>
      </header>
      <section className="hero">
        <h1>Complete a payment.</h1>
        <p>Choose an order, confirm the amount, and pay securely.</p>
      </section>
      <form className="panel" onSubmit={submit}>
        <label>
          Order
          <select value={selectedOrder?.id || ''} onChange={(event) => setSelectedId(event.target.value)}>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.merchant} - ${Number(order.amount).toFixed(2)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Amount
          <input readOnly value={selectedOrder ? `$${Number(selectedOrder.amount).toFixed(2)}` : '$0.00'} />
        </label>
        {error && <p className="error">{error}</p>}
        <button disabled={!selectedOrder} type="submit">Pay Now</button>
      </form>
      {payment && (
        <section className="receipt">
          <span>Payment complete</span>
          <strong>{payment.merchant}</strong>
          <p>${Number(payment.amount).toFixed(2)} has been sent.</p>
        </section>
      )}
      {!payment && (
        <section className="receipt">
          <span>Ready when you are</span>
          <strong>{selectedOrder ? selectedOrder.merchant : 'No order selected'}</strong>
          <p>{selectedOrder ? 'Review the details above, then pay.' : 'Create an order first.'}</p>
        </section>
      )}
    </main>
  )
}

export default App
