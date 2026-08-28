const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

async function authRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/auth${path}`, {
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

export function registerUser({ name, email, password }) {
  return authRequest('/register', {
    method: 'POST',
    body: { name, email, password },
  })
}

export function loginUser({ email, password }) {
  return authRequest('/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function getCurrentUser(token) {
  return authRequest('/me', { token })
}

export function logoutUser(token) {
  return authRequest('/logout', {
    method: 'POST',
    token,
  })
}
