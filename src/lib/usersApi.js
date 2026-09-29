const USERS_URL = 'https://6abb8fd7b2118ed7abb904f1.mockapi.io/PD/users'

async function request(url = USERS_URL, options) {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`İstek başarısız oldu (${response.status}).`)
  return response.json()
}

export function listUsers() {
  return request()
}

export function createUser({ firstName, lastName, password, role = 'user' }) {
  return request(USERS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, password, role }),
  })
}

export function updateUser(id, changes) {
  return request(`${USERS_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  })
}

export function deleteUser(id) {
  return request(`${USERS_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
