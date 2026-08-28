import { useEffect, useState } from 'react'
import { createOrder, listOrders } from './services/orders'

function App() {
  const [orders, setOrders] = useState([])
  const [merchant, setMerchant] = useState('Kilimani Coffee')
  const [description, setDescription] = useState('Team breakfast order')
  const [amount, setAmount] = useState('32.50')
  const [error, setError] = useState('')

  const refresh = () => {
    listOrders('demo-user')
      .then((data) => setOrders(data.orders))
      .catch((requestError) => setError(requestError.message))
  }

  useEffect(refresh, [])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const data = await createOrder({ merchant, description, amount })
      setOrders((items) => [data.order, ...items])
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="page">
      <header>
        <a href="/">PurplePay</a>
        <span>Orders</span>
      </header>
      <section className="hero">
        <h1>Prepare a payment request.</h1>
        <p>Add who you are paying, what it is for, and the amount due.</p>
      </section>
      <form className="order-form" onSubmit={submit}>
        <label>
          Merchant
          <input value={merchant} onChange={(event) => setMerchant(event.target.value)} />
        </label>
        <label>
          Note
          <input value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label>
          Amount
          <input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </label>
        <button type="submit">Save Order</button>
      </form>
      {error && <p className="error">{error}</p>}
      <section className="list">
        {orders.length === 0 && (
          <article>
            <div>
              <strong>No orders yet</strong>
              <p>Your saved orders will appear here.</p>
            </div>
          </article>
        )}
        {orders.map((order) => (
          <article key={order.id}>
            <div>
              <strong>{order.merchant}</strong>
              <p>{order.description}</p>
            </div>
            <span>{order.id.slice(0, 8)}</span>
            <strong>${Number(order.amount).toFixed(2)}</strong>
            <em>{order.status}</em>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
