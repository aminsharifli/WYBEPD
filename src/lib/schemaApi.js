const RANKS_URL = 'https://6abbd366b2118ed7abb95cf8.mockapi.io/pd/ranks'
const UNITS_URL = 'https://6abbd366b2118ed7abb95cf8.mockapi.io/pd/units'
const ROSTER_URL = 'https://6abb8fd7b2118ed7abb904f1.mockapi.io/PD/Sema'

async function readResponse(response, label) {
  if (!response.ok) throw new Error(`${label} API isteği başarısız oldu (${response.status}).`)
  return response.json()
}

async function readList(url, label) {
  const data = await readResponse(await fetch(url), label)
  if (!Array.isArray(data)) throw new Error(`${label} API yanıtı liste biçiminde değil.`)
  return data
}

export async function getSchema() {
  const [ranks, units, roster] = await Promise.all([
    readList(RANKS_URL, 'Rütbeler'),
    readList(UNITS_URL, 'Birimler'),
    readList(ROSTER_URL, 'Şema'),
  ])
  return { ranks, units, roster }
}

export async function addRosterMember(schema, member) {
  const created = await readResponse(await fetch(ROSTER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  }), 'Personel ekleme')
  return { ...schema, roster: [...schema.roster, created] }
}

export async function deleteRosterMember(schema, memberId) {
  await readResponse(await fetch(`${ROSTER_URL}/${encodeURIComponent(memberId)}`, { method: 'DELETE' }), 'Personel silme')
  return { ...schema, roster: schema.roster.filter((member) => String(member.id) !== String(memberId)) }
}

export async function updateRosterMember(schema, memberId, changes) {
  const updated = await readResponse(await fetch(`${ROSTER_URL}/${encodeURIComponent(memberId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  }), 'Personel güncelleme')
  return { ...schema, roster: schema.roster.map((member) => String(member.id) === String(memberId) ? { ...member, ...updated } : member) }
}
