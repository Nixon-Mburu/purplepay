const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

async function orderRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/orders${path}`, {
    headers: { 'Content-Type': 'application/json' },
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

export function listOrders(userId = 'demo-user') {
  return orderRequest(`/?user_id=${encodeURIComponent(userId)}`)
}

export function createOrder(order) {
  return orderRequest('/', {
    method: 'POST',
    body: { ...order, currency: 'USD', user_id: order.user_id || 'demo-user' },
  })
}
