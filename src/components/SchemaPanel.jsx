import { useMemo, useState } from 'react'
import { BadgeCheck, Building2, Pencil, Plus, RefreshCw, Search, Shield, Trash2, UserRound, X } from 'lucide-react'
import { UNIT_LABELS } from '../constants'

const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500'
const RANK_ORDER = ['Polis Şefi', 'Polis Şefi Yardımcısı', 'Binbaşı', 'Yüzbaşı', 'Kıdemli Teğmen', 'Teğmen', 'Kıdemli Çavuş', 'Çavuş', 'Memur Şefi', 'Kıdemli Memur III', 'Memur II', 'Memur I', 'Cadet']
const BADGE_RULES = {
  'Polis Şefi': { min: 101, max: 101 }, 'Polis Şefi Yardımcısı': { min: 102, max: 102 },
  Binbaşı: { min: 201, max: 299 }, Yüzbaşı: { min: 301, max: 399 },
  'Kıdemli Teğmen': { min: 401, max: 450 }, Teğmen: { min: 451, max: 499 },
  'Kıdemli Çavuş': { min: 501, max: 599 }, Çavuş: { min: 601, max: 699 },
  'Memur Şefi': { min: 701, max: 799 }, 'Kıdemli Memur III': { min: 801, max: 899 },
  'Memur II': { min: 901, max: 999 }, 'Memur I': { min: 1001, max: 1099 }, Cadet: { min: 1101, max: 1199 },
}

function badgeDigits(value) {
  const normalized = String(value || '').trim().replace(/^D\s*[-–]?\s*/i, '')
  return /^\d+$/.test(normalized) ? normalized : ''
}

function getRankTone(rank) {
  if (rank === 'Polis Şefi') return { row: 'border-l-4 border-l-[#e6c36f] bg-gradient-to-r from-[#e6c36f]/15 via-[#e6c36f]/[0.04] to-transparent', badge: 'border border-[#e6c36f]/40 bg-[#e6c36f]/15 text-[#f5d98c]', level: 'Üst yönetim' }
  if (rank === 'Polis Şefi Yardımcısı') return { row: 'border-l-4 border-l-violet-400 bg-gradient-to-r from-violet-400/15 via-violet-400/[0.04] to-transparent', badge: 'border border-violet-300/30 bg-violet-400/15 text-violet-200', level: 'Üst yönetim' }
  if (['Binbaşı', 'Yüzbaşı', 'Kıdemli Teğmen', 'Teğmen'].includes(rank)) return { row: 'border-l-4 border-l-sky-400 bg-gradient-to-r from-sky-400/10 via-sky-400/[0.025] to-transparent', badge: 'border border-sky-300/25 bg-sky-400/10 text-sky-200', level: 'Komuta kadrosu' }
  return { row: 'border-l-4 border-l-transparent', badge: 'border border-slate-700 bg-slate-800 text-slate-200', level: '' }
}

export default function SchemaPanel({ schema, loading, error, onRefresh, onAdd, onUpdate, onDelete, onOpenProfile, users, isAdmin }) {
  const [open, setOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [rank, setRank] = useState('')
  const [userName, setUserName] = useState('')
  const [badgeNumber, setBadgeNumber] = useState('')
  const [unit, setUnit] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')

  const availableUsers = useMemo(() => {
    const assigned = new Set((schema?.roster || []).map((item) => item.user_name.trim().toLocaleLowerCase('tr-TR')))
    return users.map((item) => ({ ...item, displayName: `${item.firstName || ''} ${item.lastName || ''}`.trim() })).filter((item) => item.displayName && !assigned.has(item.displayName.toLocaleLowerCase('tr-TR')))
  }, [schema, users])
  const ranks = useMemo(() => {
    const options = schema?.ranks || []
    return options.some((item) => item.name === 'Cadet') ? options : [...options, { id: 'cadet', name: 'Cadet' }]
  }, [schema])
  const sortedRoster = useMemo(() => [...(schema?.roster || [])].sort((a, b) => {
    const aIndex = RANK_ORDER.indexOf(a.rank), bIndex = RANK_ORDER.indexOf(b.rank)
    const rankDiff = (aIndex < 0 ? RANK_ORDER.length : aIndex) - (bIndex < 0 ? RANK_ORDER.length : bIndex)
    if (rankDiff) return rankDiff
    return String(a.user_name || '').localeCompare(String(b.user_name || ''), 'tr-TR')
  }), [schema])
  const visibleRoster = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('tr-TR')
    return sortedRoster.filter((member) => !term || [member.rank, member.user_name, member.badge_number, member.unit].some((value) => String(value || '').toLocaleLowerCase('tr-TR').includes(term)))
  }, [sortedRoster, search])
  const badgeRule = BADGE_RULES[rank]
  const isDetective = unit === 'Detective Bureau - FTO'

  const closeForm = () => { setOpen(false); setEditingMember(null); setRank(''); setUserName(''); setBadgeNumber(''); setUnit(''); setFormError('') }
  const beginEdit = (member) => { setEditingMember(member); setRank(member.rank || ''); setUserName(member.user_name || ''); setBadgeNumber(member.badge_number || ''); setUnit(member.unit || ''); setFormError(''); setOpen(true) }

  const submit = async (event) => {
    event.preventDefault(); setFormError('')
    const enteredDigits = badgeDigits(badgeNumber), numericBadge = Number(enteredDigits)
    if (!enteredDigits || !badgeRule || numericBadge < badgeRule.min || numericBadge > badgeRule.max) {
      setFormError(badgeRule ? `Bu rütbe için rozet numarası ${badgeRule.min}${badgeRule.max !== badgeRule.min ? `–${badgeRule.max}` : ''} aralığında olmalıdır.` : 'Önce rütbe seçin.')
      return
    }
    const digits = String(numericBadge)
    if ((schema?.roster || []).some((item) => String(item.id) !== String(editingMember?.id) && badgeDigits(item.badge_number) === digits)) { setFormError('Bu rozet numarası başka bir personel tarafından kullanılıyor.'); return }
    setSaving(true)
    try {
      const changes = { rank, user_name: userName, badge_number: `${isDetective ? 'D-' : ''}${digits}`, unit: unit || null }
      if (editingMember) await onUpdate(editingMember.id, changes)
      else await onAdd(changes)
      closeForm()
    } catch (cause) { setFormError(cause.message || (editingMember ? 'Personel güncellenemedi.' : 'Personel eklenemedi.')) }
    finally { setSaving(false) }
  }

  const deleteMember = async (member) => {
    if (!window.confirm(`${member.user_name} şemadan kaldırılsın mı?`)) return
    setDeleteError(''); setDeletingId(member.id)
    try { await onDelete(member.id) }
    catch (cause) { setDeleteError(cause.message || 'Personel kaldırılamadı.') }
    finally { setDeletingId(null) }
  }

  return <main className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6">
    <section className="relative mb-6 overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-[#162847] via-[#101b2e] to-[#0d1626] p-6 sm:p-8"><div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" /><div className="relative flex flex-wrap items-end justify-between gap-5"><div><p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#e6c36f]">LOS SANTOS POLİS DEPARTMANI</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Şema</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">LSPD personelinin rütbe, rozet numarası ve birim bilgileri.</p></div><div className="flex gap-2"><button onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Yenile</button>{isAdmin && <button onClick={() => { setEditingMember(null); setRank(''); setUserName(''); setBadgeNumber(''); setUnit(''); setOpen(true); setFormError('') }} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-400"><Plus className="h-4 w-4" /> Personel ekle</button>}</div></div></section>
    {open && isAdmin && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm() }}><section role="dialog" aria-modal="true" aria-labelledby="add-personnel-title" className="my-auto w-full max-w-lg rounded-2xl border border-slate-700 bg-[#101b2e] p-5 shadow-2xl sm:p-6"><div className="mb-5 flex items-start justify-between"><div><h3 id="add-personnel-title" className="text-xl font-bold text-white">{editingMember ? 'Personel bilgilerini düzenle' : 'Şemaya personel ekle'}</h3><p className="mt-1 text-sm text-slate-400">Rütbe, rozet numarası ve birim bilgilerini belirleyin.</p></div><button type="button" onClick={closeForm} aria-label="Pencereyi kapat" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="space-y-4"><label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-300">Rütbe</span><select required value={rank} onChange={(event) => setRank(event.target.value)} className={inputClass}><option value="">Rütbe seçin</option>{ranks.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-300">İsim</span><select required value={userName} onChange={(event) => setUserName(event.target.value)} disabled={Boolean(editingMember)} className={inputClass}><option value="">Kullanıcı seçin</option>{editingMember && <option value={editingMember.user_name}>{editingMember.user_name}</option>}{availableUsers.map((item) => <option key={item.id} value={item.displayName}>{item.displayName}</option>)}</select>{!editingMember && !availableUsers.length && <span className="mt-1 block text-xs text-amber-300">Şemaya eklenebilecek yeni kullanıcı yok.</span>}</label><label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-300">Rozet numarası <span className="text-slate-500">({badgeRule ? `${badgeRule.min}${badgeRule.max !== badgeRule.min ? `–${badgeRule.max}` : ''}` : 'önce rütbe seçin'})</span></span><input required inputMode="numeric" value={badgeNumber} onChange={(event) => setBadgeNumber(event.target.value)} placeholder={badgeRule ? `${badgeRule.min}${badgeRule.max !== badgeRule.min ? `–${badgeRule.max}` : ''}` : 'Önce rütbe seçin'} disabled={!badgeRule} className={inputClass} /></label><label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-300">Birim</span><select value={unit} onChange={(event) => setUnit(event.target.value)} className={inputClass}><option value="">Birim yok</option>{(schema?.units || []).map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select>{isDetective && <span className="mt-1 block text-xs text-sky-300">Rozet numarası D- önekiyle kaydedilecek.</span>}</label>{formError && <p role="alert" className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">{formError}</p>}<div className="flex justify-end gap-2 border-t border-slate-800 pt-4"><button type="button" onClick={closeForm} className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">İptal</button><button type="submit" disabled={saving || (!editingMember && !availableUsers.length)} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50">{saving ? (editingMember ? 'Kaydediliyor…' : 'Ekleniyor…') : <><Plus className="h-4 w-4" />{editingMember ? 'Değişiklikleri kaydet' : 'Personel ekle'}</>}</button></div></form></section></div>}
    {schema && <div className="mb-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-slate-800 bg-[#0d1626] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Personel sayısı</p><p className="mt-1 text-2xl font-bold text-white">{schema.roster.length}</p></div><div className="rounded-xl border border-slate-800 bg-[#0d1626] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rütbeler</p><p className="mt-1 text-2xl font-bold text-white">{ranks.length}</p></div><div className="rounded-xl border border-slate-800 bg-[#0d1626] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Birimler</p><p className="mt-1 text-2xl font-bold text-white">{schema.units.length}</p></div></div>}
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="text-lg font-bold text-white">Personel listesi</h3><p className="mt-1 text-xs text-slate-500">Rütbeye göre sıralanır · İsimlere tıklayarak profili açın</p></div><label className="relative block w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ad, rütbe, rozet veya birim ara…" className={`${inputClass} pl-9`} /></label></div>
    {error && <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">{error}</div>}{deleteError && <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">{deleteError}</div>}
    {loading && !schema ? <div className="rounded-2xl border border-slate-800 bg-[#0d1626] p-12 text-center text-slate-400">Şema yükleniyor…</div> : schema && <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1626] shadow-xl shadow-black/10"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-700 bg-slate-950/60 text-[11px] uppercase tracking-[0.16em] text-slate-400"><tr><th className="px-5 py-4">Rütbe</th><th className="px-5 py-4">İsim</th><th className="px-5 py-4">Rozet numarası</th><th className="px-5 py-4">Birim</th>{isAdmin && <th className="px-5 py-4 text-right">İşlem</th>}</tr></thead><tbody className="divide-y divide-slate-800/80">{visibleRoster.map((member, index) => { const memberUser = users.find((item) => `${item.firstName || ''} ${item.lastName || ''}`.trim().toLocaleLowerCase('tr-TR') === member.user_name.trim().toLocaleLowerCase('tr-TR')); const tone = getRankTone(member.rank); return <tr key={member.id} className={`transition hover:bg-sky-400/[0.04] ${tone.row}`}><td className="whitespace-nowrap px-5 py-4"><div className="flex items-center gap-2"><span className="inline-grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-800 text-[10px] font-bold text-slate-400">{String(index + 1).padStart(2, '0')}</span><div><span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${tone.badge}`}>{member.rank}</span>{tone.level && <span className="mt-1 block pl-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">{tone.level}</span>}</div></div></td><td className="whitespace-nowrap px-5 py-4"><button type="button" onClick={() => onOpenProfile(memberUser?.id ?? `roster-${member.id}`, member.user_name)} className="inline-flex items-center gap-2 font-semibold text-sky-300 transition hover:text-sky-200 hover:underline"><UserRound className="h-4 w-4" />{member.user_name}</button></td><td className="whitespace-nowrap px-5 py-4"><span className="inline-flex items-center gap-2 rounded-lg border border-sky-400/15 bg-sky-400/[0.06] px-2.5 py-1.5 font-mono text-sm font-bold text-sky-200"><BadgeCheck className="h-4 w-4" />{member.badge_number || '—'}</span></td><td className="px-5 py-4"><span className="inline-flex max-w-xs items-center gap-2 text-slate-300"><Building2 className="h-4 w-4 shrink-0 text-slate-500" /><span className="truncate" title={UNIT_LABELS[member.unit] || member.unit || ''}>{UNIT_LABELS[member.unit] || member.unit || '—'}</span></span></td>{isAdmin && <td className="px-5 py-3 text-right"><button onClick={() => beginEdit(member)} aria-label="Personel bilgilerini düzenle" title="Personel bilgilerini düzenle" className="rounded-lg p-2 text-slate-500 transition hover:bg-sky-950/60 hover:text-sky-300"><Pencil className="h-4 w-4" /></button><button onClick={() => deleteMember(member)} disabled={deletingId === member.id} aria-label={`${member.user_name} kişisini sil`} title="Personeli sil" className="rounded-lg p-2 text-slate-500 transition hover:bg-red-950/60 hover:text-red-300 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></td>}</tr>})}</tbody></table></div>{!visibleRoster.length && <div className="px-6 py-12 text-center"><Shield className="mx-auto h-8 w-8 text-slate-600" /><p className="mt-3 font-semibold text-slate-200">{search ? 'Aramayla eşleşen personel bulunamadı' : 'Şemada henüz personel yok'}</p><p className="mt-1 text-sm text-slate-500">{search ? 'Başka bir ad, rütbe veya birim arayın.' : 'Yönetici personel eklediğinde burada görünecek.'}</p></div>}</div>}
  </main>
}
