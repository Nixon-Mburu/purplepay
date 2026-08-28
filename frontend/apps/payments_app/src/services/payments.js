const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}),
    },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

export function listOrders() {
  return api('/api/orders/?user_id=demo-user')
}

export function createPayment(order) {
  return api('/api/payments/', {
    method: 'POST',
    idempotencyKey: `pay-${order.id}`,
    body: {
      order_id: order.id,
      user_id: order.user_id || 'demo-user',
      merchant: order.merchant,
      amount: order.amount,
      currency: order.currency || 'USD',
    },
  })
}
