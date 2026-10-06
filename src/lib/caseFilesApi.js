const CASE_FILES_URL = 'https://6a96b37d0e3240db90614f54.mockapi.io/LSPD/Dosyalar'

function responseError(response) {
  const error = new Error(`Sunucu isteği başarısız oldu (${response.status}).`)
  error.status = response.status
  return error
}

export async function listCaseFiles() {
  const response = await fetch(CASE_FILES_URL)
  if (!response.ok) throw responseError(response)
  return response.json()
}

export async function saveCaseFile(payload) {
  const response = await fetch(CASE_FILES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw responseError(response)
  return response.json()
}

export async function updateCaseFileStatus(id, status) {
  const response = await fetch(`${CASE_FILES_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) throw responseError(response)
  return response.json()
}

export async function updateCaseFileRecord(id, changes) {
  const currentResponse = await fetch(`${CASE_FILES_URL}/${id}`)
  if (!currentResponse.ok) throw responseError(currentResponse)
  const current = await currentResponse.json()
  const response = await fetch(`${CASE_FILES_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...current, ...changes }),
  })
  if (!response.ok) throw responseError(response)
  return response.json()
}

export async function approveCaseFile(id, amirApproval) {
  const response = await fetch(`${CASE_FILES_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amirApproval }),
  })
  if (!response.ok) throw responseError(response)
  return response.json()
}

export async function updateCaseFile(id, payload) {
  const response = await fetch(`${CASE_FILES_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw responseError(response)
  return response.json()
}

export async function deleteCaseFile(id) {
  const response = await fetch(`${CASE_FILES_URL}/${id}`, { method: 'DELETE' })
  if (!response.ok) throw responseError(response)
}

// Uygulamanın form alanları ile MockAPI'deki alan adları arasındaki tek kaynak eşleme.
async function compressEvidenceImage(source) {
  if (!source) return ''

  // Sunucudaki bir URL zaten küçük bir JSON alanıdır; Base64 görselleri ise optimize ederiz.
  if (!source.startsWith('data:image/')) return source

  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      const maxSide = 400
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
      const width = Math.max(1, Math.round(image.naturalWidth * scale))
      const height = Math.max(1, Math.round(image.naturalHeight * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      context.drawImage(image, 0, 0, width, height)
      // JPEG ve %60 kalite, MockAPI isteğini gereksiz büyük Base64 verilerinden korur.
      resolve(canvas.toDataURL('image/jpeg', 0.6))
    }
    image.onerror = () => resolve('')
    image.src = source
  })
}

export async function toApiCaseFile(form, evidence, profileId) {
  const evidenceImages = await Promise.all(evidence.map(async (item) => ({
    src: await compressEvidenceImage(item.src),
    caption: item.caption || '',
    name: item.name || '',
  })))
  return {
    createdAt: new Date().toISOString(),
    caseId: form.caseId,
    documentType: form.docType,
    status: form.status,
    amirApproval: form.amirApproval || '',
    rejected: Boolean(form.rejected),
    rejectedBy: form.rejectedBy || '',
    rejectedAt: form.rejectedAt || '',
    rejectionReason: form.rejectionReason || '',
    issueReport: form.issueReport || '',
    issueReportedBy: form.issueReportedBy || '',
    issueReportedAt: form.issueReportedAt || '',
    activityHistory: Array.isArray(form.activityHistory) ? form.activityHistory : [],
    date: form.date,
    time: form.time,
    officerName: form.officerName,
    badgeNumber: form.badgeNumber,
    suspectName: form.suspects,
    title: form.sectionTitle,
    narrative: form.narrative,
    charges: form.charges,
    // Keep the legacy first-image fields so older clients can still read new files.
    evidenceImages,
    evidenceImage: evidenceImages[0]?.src || '',
    evidenceCaption: evidenceImages[0]?.caption || '',
    profil_id: String(profileId),
  }
}

export function fromApiCaseFile(file) {
  const evidence = Array.isArray(file.evidenceImages) && file.evidenceImages.length
    ? file.evidenceImages.map((item, index) => ({
      id: `archive-${file.id}-${index}`,
      src: typeof item === 'string' ? item : item.src || '',
      caption: typeof item === 'string' ? '' : item.caption || '',
      name: typeof item === 'string' ? 'Kayıtlı kanıt' : item.name || 'Kayıtlı kanıt',
    })).filter((item) => item.src)
    : file.evidenceImage
      ? [{ id: `archive-${file.id}`, src: file.evidenceImage, caption: file.evidenceCaption || '', name: 'Kayıtlı kanıt' }]
      : []
  return {
    form: {
      docType: file.documentType || '',
      caseId: file.caseId || '',
      date: file.date || '',
      time: file.time || '',
      officerName: file.officerName || '',
      badgeNumber: file.badgeNumber || '',
      suspects: file.suspectName || '',
      sectionTitle: file.title || '',
      narrative: file.narrative || '',
      charges: file.charges || '',
      status: file.status || '',
      amirApproval: file.amirApproval || '',
      rejected: Boolean(file.rejected),
      rejectedBy: file.rejectedBy || '',
      rejectedAt: file.rejectedAt || '',
      rejectionReason: file.rejectionReason || '',
      issueReport: file.issueReport || '',
      issueReportedBy: file.issueReportedBy || '',
      issueReportedAt: file.issueReportedAt || '',
      activityHistory: Array.isArray(file.activityHistory) ? file.activityHistory : [],
      rejected: Boolean(file.rejected),
      rejectedBy: file.rejectedBy || '',
      rejectedAt: file.rejectedAt || '',
      rejectionReason: file.rejectionReason || '',
      issueReport: file.issueReport || '',
      issueReportedBy: file.issueReportedBy || '',
      issueReportedAt: file.issueReportedAt || '',
      activityHistory: Array.isArray(file.activityHistory) ? file.activityHistory : [],
    },
    evidence,
  }
}
