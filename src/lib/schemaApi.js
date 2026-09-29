const SCHEMA_URL = 'https://6abb8fd7b2118ed7abb904f1.mockapi.io/PD/Sema'

async function readResponse(response) {
  if (!response.ok) throw new Error(`Şema API isteği başarısız oldu (${response.status}).`)
  return response.json()
}

function extractSchema(payload) {
  const records = Array.isArray(payload) ? payload : [payload]
  const record = [...records].reverse().find((item) => item?.data?.ranks && item?.data?.units && item?.data?.roster)
  if (!record) throw new Error('API yanıtında rütbeler, birimler ve personel listesi bulunamadı.')
  return record.data
}

export async function getSchema() {
  return extractSchema(await readResponse(await fetch(SCHEMA_URL)))
}

export async function addRosterMember(schema, member) {
  const updated = { ...schema, roster: [...schema.roster, { ...member, id: Date.now() }] }
  await saveSchemaSnapshot(updated)
  return updated
}

export async function deleteRosterMember(schema, memberId) {
  const updated = { ...schema, roster: schema.roster.filter((member) => String(member.id) !== String(memberId)) }
  await saveSchemaSnapshot(updated)
  return updated
}

export async function updateRosterMember(schema, memberId, changes) {
  const updated = {
    ...schema,
    roster: schema.roster.map((member) => String(member.id) === String(memberId) ? { ...member, ...changes } : member),
  }
  await saveSchemaSnapshot(updated)
  return updated
}

async function saveSchemaSnapshot(data) {
  // API yanıtında şema kaydının ID'si olmadığı için değişiklikler yeni bir kayıt olarak eklenir.
  const response = await fetch(SCHEMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, data }),
  })
  await readResponse(response)
}
