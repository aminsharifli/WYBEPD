import { Bell, CircleCheck, CircleAlert, FileClock, Megaphone, Trash2, X } from 'lucide-react'
import { formatTurkeyDateTime } from '../lib/helpers'

const icons = { approved: CircleCheck, rejected: CircleAlert, issue: CircleAlert, pending: FileClock }

function MessageWithMentions({ item, onOpen, onMention }) {
  const mentions = (item.mentions || []).map((person) => ({ ...person, token: `@${person.tag}` })).filter((person) => person.tag).sort((a, b) => b.token.length - a.token.length)
  const chunks = []
  let cursor = 0
  while (cursor < item.text.length) {
    const match = mentions.map((person) => ({ person, index: item.text.indexOf(person.token, cursor) })).filter((result) => result.index >= 0).sort((a, b) => a.index - b.index)[0]
    if (!match) { chunks.push(item.text.slice(cursor)); break }
    if (match.index > cursor) chunks.push(item.text.slice(cursor, match.index))
    chunks.push(<button type="button" key={`${match.person.userId}-${match.index}`} onClick={() => { onOpen(item); onMention(match.person) }} className="announcement-mention">{item.text.slice(match.index, match.index + match.person.token.length)}</button>)
    cursor = match.index + match.person.token.length
  }
  return <p className="announcement-message">{chunks}</p>
}

export default function NotificationsPanel({ items, unreadCount, onOpen, onMention, onDelete, onClose }) {
  return <section className="notification-panel" aria-label="Bildirimler">
    <header><div><Bell className="h-4 w-4 text-sky-300" /><strong>Bildirimler</strong><span>{unreadCount} yeni</span></div><button type="button" onClick={onClose} aria-label="Bildirimleri kapat"><X className="h-4 w-4" /></button></header>
    <div className="notification-list">{items.length ? items.map((item) => {
      if (item.type === 'announcement') return <article key={item.id} className={`announcement-notification${item.readAt ? ' is-read' : ''}`}>
        <header><div><Megaphone className="h-4 w-4" /><span>GENEL DUYURU</span></div><div className="announcement-head-actions">{!item.readAt && <i>YENİ</i>}{item.canDelete && <button type="button" aria-label="Duyuruyu sil" title="Duyuruyu sil" onClick={() => onDelete(item)} className="announcement-delete"><Trash2 className="h-4 w-4" /></button>}</div></header>
        <p className="announcement-author">{item.authorName || 'Personel'} · {item.at ? formatTurkeyDateTime(item.at) : ''}</p>
        <MessageWithMentions item={item} onOpen={onOpen} onMention={onMention} />
        <button type="button" onClick={() => onOpen(item)} className="announcement-read-button">{item.readAt ? 'Okundu' : 'Bildirimi okundu olarak işaretle'}</button>
      </article>
      const Icon = icons[item.type] || Bell
      return <button type="button" key={item.id} onClick={() => onOpen(item)} className={`notification-item${item.readAt ? ' is-read' : ''}`}>
        <Icon className={`h-4 w-4 shrink-0 ${item.type === 'rejected' || item.type === 'issue' ? 'text-red-300' : item.type === 'approved' ? 'text-emerald-300' : 'text-sky-300'}`} />
        <span><strong>{item.text}</strong><small>{item.at ? formatTurkeyDateTime(item.at) : 'Yeni'}{item.readAt ? ' · Okundu' : ' · Yeni'}</small></span>
      </button>
    }) : <p className="notification-empty">Yeni bildiriminiz yok.</p>}</div>
  </section>
}
