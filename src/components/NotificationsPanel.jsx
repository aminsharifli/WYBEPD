import { Bell, CircleCheck, CircleAlert, FileClock, X } from 'lucide-react'

const icons = { approved: CircleCheck, rejected: CircleAlert, issue: CircleAlert, pending: FileClock }

export default function NotificationsPanel({ items, onOpen, onClose }) {
  return <section className="notification-panel" aria-label="Bildirimler">
    <header><div><Bell className="h-4 w-4 text-sky-300" /><strong>Bildirimler</strong><span>{items.length}</span></div><button type="button" onClick={onClose} aria-label="Bildirimleri kapat"><X className="h-4 w-4" /></button></header>
    <div className="notification-list">{items.length ? items.map((item) => {
      const Icon = icons[item.type] || Bell
      return <button type="button" key={item.id} onClick={() => onOpen(item)} className={`notification-item${item.readAt ? ' is-read' : ''}`}>
        <Icon className={`h-4 w-4 shrink-0 ${item.type === 'rejected' || item.type === 'issue' ? 'text-red-300' : item.type === 'approved' ? 'text-emerald-300' : 'text-sky-300'}`} />
        <span><strong>{item.text}</strong><small>{item.at ? new Date(item.at).toLocaleString('tr-TR') : 'Yeni'}{item.readAt ? ' · Okundu' : ' · Yeni'}</small></span>
      </button>
    }) : <p className="notification-empty">Yeni bildiriminiz yok.</p>}</div>
  </section>
}
