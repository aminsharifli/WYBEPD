import { useMemo, useRef, useState } from 'react'

const compactName = (value) => String(value || '').replace(/[^\p{L}\p{N}_]/gu, '')

export default function OfficerMentionTextarea({ value, onChange, roster = [], users = [], ...props }) {
  const ref = useRef(null)
  const [cursor, setCursor] = useState(0)
  const activeMention = String(value || '').slice(0, cursor).match(/(?:^|\s)@([^\s@]*)$/u)
  const query = activeMention?.[1]?.toLocaleLowerCase('tr-TR')
  const choices = useMemo(() => {
    if (query === undefined) return []
    return roster.map((member) => {
      const displayName = String(member.user_name || '').trim()
      const user = users.find((person) => `${person.firstName || ''} ${person.lastName || ''}`.trim().toLocaleLowerCase('tr-TR') === displayName.toLocaleLowerCase('tr-TR'))
      return { displayName, tag: compactName(displayName), userId: user?.id }
    }).filter((person) => person.displayName && person.tag.toLocaleLowerCase('tr-TR').startsWith(query)).slice(0, 6)
  }, [query, roster, users])

  const selectMention = (person) => {
    const text = String(value || '')
    const start = ref.current?.selectionStart ?? cursor
    const end = ref.current?.selectionEnd ?? cursor
    const prefix = text.slice(0, start).replace(/(?:^|\s)@[^\s@]*$/u, (match) => match.startsWith(' ') ? ' ' : '')
    const insertion = `@${person.tag} `
    const next = `${prefix}${insertion}${text.slice(end)}`
    onChange(next)
    requestAnimationFrame(() => {
      const target = prefix.length + insertion.length
      ref.current?.focus()
      ref.current?.setSelectionRange(target, target)
    })
  }

  return <div className="relative">
    <textarea ref={ref} value={value} onChange={(event) => { onChange(event.target.value); setCursor(event.target.selectionStart) }} onClick={(event) => setCursor(event.currentTarget.selectionStart)} onKeyUp={(event) => setCursor(event.currentTarget.selectionStart)} {...props} />
    {choices.length > 0 && <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">{choices.map((person) => <button type="button" key={`${person.userId || person.tag}-${person.tag}`} onMouseDown={(event) => event.preventDefault()} onClick={() => selectMention(person)} className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-slate-800"><span className="font-semibold text-white">{person.displayName}<small className="ml-2 text-slate-400">@{person.tag}</small></span><span className="text-xs text-sky-300">Etiketle</span></button>)}</div>}
  </div>
}
