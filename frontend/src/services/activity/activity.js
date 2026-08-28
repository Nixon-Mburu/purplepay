const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export async function listActivity({ limit = 25 } = {}) {
  const response = await fetch(`${API_BASE_URL}/api/activity?limit=${limit}`)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong')
  }

  return data
}
