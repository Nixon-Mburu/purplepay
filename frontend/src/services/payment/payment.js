const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

async function paymentRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/payments${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.idempotencyKey
        ? { 'Idempotency-Key': options.idempotencyKey }
        : {}),
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong')
  }

  return data
}

export function listPayments({ userId, token }) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : ''
  return paymentRequest(`/${query}`, { token })
}

export function createPayment({ order, token }) {
  return paymentRequest('/', {
    method: 'POST',
    token,
    idempotencyKey: `pay-${order.id}`,
    body: {
      amount: order.amount,
      currency: order.currency || 'USD',
      merchant: order.merchant,
      order_id: order.id,
      user_id: order.user_id,
    },
  })
}
