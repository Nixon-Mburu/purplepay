const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

async function orderRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/orders${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
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

export function listOrders({ userId, token }) {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : ''
  return orderRequest(`/${query}`, { token })
}

export function createOrder({ merchant, description, amount, userId, token }) {
  return orderRequest('/', {
    method: 'POST',
    token,
    body: {
      amount,
      currency: 'USD',
      description,
      merchant,
      user_id: userId,
    },
  })
}

export function getOrder({ orderId, token }) {
  return orderRequest(`/${orderId}`, { token })
}
