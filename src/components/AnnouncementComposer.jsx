import { useMemo, useRef, useState } from 'react'
import { Loader2, Megaphone, Send, X } from 'lucide-react'

const compactName = (value) => String(value || '').replace(/[^\p{L}\p{N}_]/gu, '')

export default function AnnouncementComposer({ roster, users, onSend, onClose }) {
  const [message, setMessage] = useState('')
  const [mentions, setMentions] = useState([])
  const [cursor, setCursor] = useState(0)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const textRef = useRef(null)
  const activeMention = message.slice(0, cursor).match(/(?:^|\s)@([^\s@]*)$/u)
  const query = activeMention?.[1]?.toLocaleLowerCase('tr-TR')
  const choices = useMemo(() => {
    if (query === undefined) return []
    return roster.map((member) => {
      const displayName = String(member.user_name || '').trim()
      const tag = compactName(displayName)
      const user = users.find((item) => `${item.firstName || ''} ${item.lastName || ''}`.trim().toLocaleLowerCase('tr-TR') === displayName.toLocaleLowerCase('tr-TR'))
      return { displayName, tag, userId: user?.id ?? `roster-${member.id}`, rank: member.rank }
    }).filter((item) => item.displayName && item.tag.toLocaleLowerCase('tr-TR').startsWith(query)).slice(0, 6)
  }, [query, roster, users])

  const selectMention = (person) => {
    const start = textRef.current?.selectionStart ?? cursor
    const end = textRef.current?.selectionEnd ?? cursor
    const prefix = message.slice(0, start).replace(/(?:^|\s)@[^\s@]*$/u, (match) => match.startsWith(' ') ? ' ' : '')
    const suffix = message.slice(end)
    const insertion = `@${person.tag} `
    const next = `${prefix}${insertion}${suffix}`
    setMessage(next)
    setMentions((current) => [...current.filter((item) => item.tag !== person.tag), person])
    setError('')
    requestAnimationFrame(() => { textRef.current?.focus(); textRef.current?.setSelectionRange(prefix.length + insertion.length, prefix.length + insertion.length) })
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!message.trim()) { setError('Elan metnini yazın.'); return }
    const usedMentions = mentions.filter((item) => message.includes(`@${item.tag}`))
    setSending(true); setError('')
    try { const sent = await onSend(message.trim(), usedMentions); if (sent) onClose() }
    catch (cause) { setError(cause.message || 'Elan göndərilə bilmədi.') }
    finally { setSending(false) }
  }

  return <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section role="dialog" aria-modal="true" aria-labelledby="announcement-title" className="my-auto w-full max-w-xl rounded-2xl border border-slate-700 bg-[#101b2e] p-5 shadow-2xl sm:p-6"><header className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-sky-300"><Megaphone className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[.2em]">Genel duyuru</p></div><h2 id="announcement-title" className="mt-2 text-xl font-bold text-white">Tüm personele bildirim gönder</h2><p className="mt-1 text-sm text-slate-400">Şemadaki kişileri @ ile etiketleyin.</p></div><button type="button" onClick={onClose} aria-label="Pencereyi kapat" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button></header><form onSubmit={submit} className="mt-5 space-y-4"><div className="relative"><label htmlFor="announcement-message" className="mb-2 block text-sm font-semibold text-slate-300">Duyuru metni</label><textarea ref={textRef} id="announcement-message" autoFocus rows={6} value={message} onChange={(event) => { setMessage(event.target.value); setCursor(event.target.selectionStart); setError('') }} onClick={(event) => setCursor(event.currentTarget.selectionStart)} onKeyUp={(event) => setCursor(event.currentTarget.selectionStart)} placeholder="Örn. Arkadaşlar silah arkadaşımız olan @MartinAnderson rütbe yükseldi…" className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-sky-500" />{choices.length > 0 && <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">{choices.map((person) => <button type="button" key={`${person.userId}-${person.tag}`} onMouseDown={(event) => event.preventDefault()} onClick={() => selectMention(person)} className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-slate-800"><span className="font-semibold text-white">{person.displayName}<small className="ml-2 text-slate-500">@{person.tag}</small></span><span className="text-xs text-sky-300">{person.rank}</span></button>)}</div>}</div>{error && <p role="alert" className="text-sm text-red-300">{error}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">İptal</button><button type="submit" disabled={sending || !message.trim()} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-500 disabled:opacity-50">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{sending ? 'Gönderiliyor…' : 'Herkese gönder'}</button></div></form></section></div>
}
