const COMMENTS_URL = 'https://6abba1ceb2118ed7abb91958.mockapi.io/PD/comment'

async function readResponse(response) {
  if (!response.ok) throw new Error(`Yorum API isteği başarısız oldu (${response.status}).`)
  return response.json()
}

export async function listComments() {
  const data = await readResponse(await fetch(COMMENTS_URL))
  return Array.isArray(data) ? data : []
}

export async function createComment({ profileId, comment, authorId }) {
  return readResponse(await fetch(COMMENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile_id: String(profileId),
      rating: 0,
      comment: comment.trim(),
      created_at: new Date().toISOString(),
      author_id: String(authorId),
      type: 'comment',
    }),
  }))
}

export async function createProfileLike({ profileId, authorId }) {
  return readResponse(await fetch(COMMENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile_id: String(profileId),
      rating: 0,
      comment: '',
      created_at: new Date().toISOString(),
      author_id: String(authorId),
      type: 'like',
    }),
  }))
}

export async function listAnnouncements() {
  const data = await listComments()
  return data.filter((item) => item.type === 'announcement').sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
}

export async function createAnnouncement({ comment, authorId, authorName, mentions }) {
  return readResponse(await fetch(COMMENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile_id: 'global-announcements',
      rating: 0,
      comment: comment.trim(),
      created_at: new Date().toISOString(),
      author_id: String(authorId),
      author_name: authorName,
      mentions,
      type: 'announcement',
    }),
  }))
}

export async function deleteComment(commentId) {
  return readResponse(await fetch(`${COMMENTS_URL}/${encodeURIComponent(commentId)}`, { method: 'DELETE' }))
}

