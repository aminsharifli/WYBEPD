import { useEffect, useState } from 'react'
import { ImagePlus, Loader2, RefreshCw, Trash2, UserPlus } from 'lucide-react'
import { addSlide, deleteSlide, listSlides } from '../lib/sliderApi'

const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500'

export default function AdminPanel({ users, onCreateUser, onDeleteUser, onUsersRefresh, currentUserId }) {
  const [slides, setSlides] = useState([])
  const [photo, setPhoto] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [userForm, setUserForm] = useState({ firstName: '', lastName: '', password: '' })
  const [creatingUser, setCreatingUser] = useState(false)
  const [removingUserId, setRemovingUserId] = useState(null)

  async function refreshSlides() {
    setLoading(true); setError('')
    try { setSlides(await listSlides()) } catch (cause) { setError(`Slider yüklenemedi: ${cause.message}`) }
    finally { setLoading(false) }
  }
  useEffect(() => { refreshSlides() }, [])

  async function submitSlide(event) {
    event.preventDefault(); setError(''); setNotice('')
    if (!/^https?:\/\//i.test(photo.trim())) { setError('Geçerli bir görsel URL’si girin.'); return }
    setSaving(true)
    try { const created = await addSlide(photo.trim()); setSlides((items) => [...items, created]); setPhoto(''); setNotice('Görsel ana sayfa slider’ına eklendi.') }
    catch (cause) { setError(`Görsel eklenemedi: ${cause.message}`) }
    finally { setSaving(false) }
  }
  async function removeSlide(slide) {
    setDeletingId(slide.id); setError(''); setNotice('')
    try { await deleteSlide(slide.id); setSlides((items) => items.filter((item) => String(item.id) !== String(slide.id))) }
    catch (cause) { setError(`Görsel silinemedi: ${cause.message}`) }
    finally { setDeletingId(null) }
  }
  async function submitUser(event) {
    event.preventDefault(); setError(''); setNotice(''); setCreatingUser(true)
    try { await onCreateUser(userForm); setUserForm({ firstName: '', lastName: '', password: '' }); setNotice('Kullanıcı hesabı oluşturuldu.') }
    catch (cause) { setError(`Hesap oluşturulamadı: ${cause.message}`) }
    finally { setCreatingUser(false) }
  }
  async function removeUser(person) {
    if (String(person.id) === String(currentUserId)) { setError('Kendi hesabınızı bu bölümden silemezsiniz.'); return }
    if (!window.confirm(`${person.firstName} ${person.lastName} hesabı kalıcı olarak silinsin mi?`)) return
    setError(''); setNotice(''); setRemovingUserId(person.id)
    try { await onDeleteUser(person); setNotice('Kullanıcı hesabı silindi.') }
    catch (cause) { setError(`Hesap silinemedi: ${cause.message}`) }
    finally { setRemovingUserId(null) }
  }

  return <main className="mx-auto max-w-[1280px] space-y-6 px-4 py-7 sm:px-6">
    <header className="rounded-2xl border border-slate-700 bg-gradient-to-br from-[#162847] via-[#101b2e] to-[#0d1626] p-6 sm:p-8"><p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#1680ff]">WYBE-LSPD · YÖNETİM</p><h2 className="mt-2 text-3xl font-bold text-white">Yönetim Merkezi</h2><p className="mt-2 text-sm text-slate-300">Ana sayfa görsellerini ve kullanıcı hesaplarını yönetin.</p></header>
    {error && <p role="alert" className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">{error}</p>}{notice && <p role="status" className="rounded-lg border border-emerald-900 bg-emerald-950/30 p-4 text-sm text-emerald-300">{notice}</p>}
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1626]"><div className="flex items-center justify-between border-b border-slate-800 p-5"><div><h3 className="font-bold text-white">Ana sayfa slider’ı</h3><p className="mt-1 text-xs text-slate-500">Görsel bağlantısı ekleyin veya yayındaki görselleri kaldırın.</p></div><button onClick={refreshSlides} disabled={loading} aria-label="Slider görsellerini yenile" className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div><form onSubmit={submitSlide} className="space-y-3 border-b border-slate-800 p-5"><label className="block text-xs font-semibold text-slate-300">Görsel URL’si<input required type="url" value={photo} onChange={(event) => setPhoto(event.target.value)} placeholder="https://…" className={`${inputClass} mt-1.5`} /></label>{photo && <img src={photo} alt="Slider görseli önizlemesi" className="h-36 w-full rounded-lg border border-slate-800 object-cover" onError={(event) => { event.currentTarget.style.opacity = '0.35' }} /> }<button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-sky-400 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Görsel ekle</button></form><div className="space-y-3 p-5">{loading ? <p className="py-5 text-center text-sm text-slate-400">Görseller yükleniyor…</p> : slides.length ? slides.map((slide) => <article key={slide.id} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-2"><img src={slide.photo} alt="Ana sayfa slider görseli" className="h-16 w-24 shrink-0 rounded-lg object-cover" /><p className="min-w-0 flex-1 truncate text-xs text-slate-400" title={slide.photo}>{slide.photo}</p><button onClick={() => removeSlide(slide)} disabled={deletingId === slide.id} aria-label="Görseli sil" className="rounded-lg p-2 text-slate-500 hover:bg-red-950/60 hover:text-red-300 disabled:opacity-50">{deletingId === slide.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button></article>) : <p className="py-5 text-center text-sm text-slate-500">Henüz slider görseli eklenmedi.</p>}</div></section>
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1626]"><div className="border-b border-slate-800 p-5"><h3 className="font-bold text-white">Kullanıcı hesabı oluştur</h3><p className="mt-1 text-xs text-slate-500">Hesapları yalnızca yöneticiler oluşturabilir.</p></div><form onSubmit={submitUser} className="space-y-4 border-b border-slate-800 p-5"><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-300">Ad<input required value={userForm.firstName} onChange={(event) => setUserForm({ ...userForm, firstName: event.target.value })} className={`${inputClass} mt-1.5`} /></label><label className="text-xs font-semibold text-slate-300">Soyad<input required value={userForm.lastName} onChange={(event) => setUserForm({ ...userForm, lastName: event.target.value })} className={`${inputClass} mt-1.5`} /></label></div><label className="block text-xs font-semibold text-slate-300">Şifre<input required minLength={6} type="password" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} className={`${inputClass} mt-1.5`} /></label><button disabled={creatingUser} className="inline-flex items-center gap-2 rounded-lg bg-[#1680ff] px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-[#dbb463] disabled:opacity-50">{creatingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Hesap oluştur</button></form><div className="flex items-center justify-between border-b border-slate-800 px-5 py-4"><div><h4 className="text-sm font-semibold text-white">Kayıtlı kullanıcılar</h4><p className="text-xs text-slate-500">{users.length} hesap</p></div><button onClick={onUsersRefresh} title="Kullanıcıları yenile" className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"><RefreshCw className="h-4 w-4" /></button></div><div className="max-h-80 divide-y divide-slate-800 overflow-auto">{users.map((person) => <div key={person.id} className="flex items-center justify-between gap-3 px-5 py-3"><span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">{person.firstName} {person.lastName}</span><span className="rounded-full border border-slate-700 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-400">{person.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}</span><button onClick={() => removeUser(person)} disabled={removingUserId === person.id || String(person.id) === String(currentUserId)} title={String(person.id) === String(currentUserId) ? 'Kendi hesabınız silinemez' : 'Hesabı sil'} aria-label={`${person.firstName} ${person.lastName} hesabını sil`} className="rounded-lg p-2 text-slate-500 hover:bg-red-950/60 hover:text-red-300 disabled:opacity-30">{removingUserId === person.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button></div>)}</div></section>
    </div>
  </main>
}

