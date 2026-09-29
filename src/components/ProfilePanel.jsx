import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Building2, Eye, Heart, MessageSquareText, Send, Shield, UserRound } from 'lucide-react'
import { createComment, createProfileLike, listComments } from '../lib/commentsApi'
import { listCaseFiles } from '../lib/caseFilesApi'
import { UNIT_LABELS } from '../constants'

const fieldClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500'
const displayName = (user) => `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
const isLikeRecord = (item) => item.type === 'like' || (Number(item.rating) === 0 && !String(item.comment || '').trim())

export default function ProfilePanel({ users, currentUser, profileUserId, profileName, onOpenProfile, onOpenCaseFile, schema, schemaLoading }) {
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentsError, setCommentsError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)
  const [liking, setLiking] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [caseFiles, setCaseFiles] = useState([])
  const [caseFilesLoading, setCaseFilesLoading] = useState(true)
  const [caseFilesError, setCaseFilesError] = useState('')

  const profileUser = users.find((item) => String(item.id) === String(profileUserId)) || (String(profileUserId) === String(currentUser.id) ? currentUser : { id: profileUserId, firstName: profileName, role: 'user' })
  const ownProfile = String(profileUser.id) === String(currentUser.id)
  const profileId = String(profileUser.id)
  const profileComments = useMemo(() => comments.filter((item) => !isLikeRecord(item) && String(item.profile_id) === profileId).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)), [comments, profileId])
  const profileLikes = useMemo(() => comments.filter((item) => isLikeRecord(item) && String(item.profile_id) === profileId), [comments, profileId])
  const authoredFiles = useMemo(() => caseFiles.filter((item) => String(item.profil_id) === profileId).sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)), [caseFiles, profileId])
  const alreadyLiked = profileLikes.some((item) => String(item.author_id) === String(currentUser.id))
  const rosterEntry = schema?.roster?.find((entry) => entry.user_name?.trim().toLocaleLowerCase() === displayName(profileUser).toLocaleLowerCase())

  useEffect(() => {
    let active = true
    setCommentsLoading(true); setCommentsError('')
    listComments().then((data) => { if (active) setComments(data) }).catch((error) => { if (active) setCommentsError(error.message) }).finally(() => { if (active) setCommentsLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    setCaseFilesLoading(true); setCaseFilesError('')
    listCaseFiles().then((data) => { if (active) setCaseFiles(data) }).catch((error) => { if (active) setCaseFilesError(error.message) }).finally(() => { if (active) setCaseFilesLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => { setCommentText(''); setFormError(''); setNotice('') }, [profileId])

  async function submit(event) {
    event.preventDefault(); setFormError(''); setNotice(''); setSending(true)
    try {
      const created = await createComment({ profileId: profileUser.id, comment: commentText, authorId: currentUser.id })
      setComments((items) => [...items, created]); setCommentText(''); setNotice('Yorumunuz profile eklendi.')
    } catch (error) { setFormError(error.message || 'Yorum gönderilemedi.') }
    finally { setSending(false) }
  }

  async function likeProfile() {
    if (ownProfile || alreadyLiked || liking || commentsLoading || commentsError) return
    setFormError(''); setNotice(''); setLiking(true)
    try {
      const created = await createProfileLike({ profileId: profileUser.id, authorId: currentUser.id })
      setComments((items) => [...items, created]); setNotice('Beğeniniz kaydedildi.')
    } catch (error) { setFormError(error.message || 'Beğeni kaydedilemedi.') }
    finally { setLiking(false) }
  }

  return <main className="mx-auto max-w-[1120px] px-4 py-7 sm:px-6">
    <div className="mb-6"><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c9a24b]">LSPD · PERSONEL</p><h2 className="mt-1 text-2xl font-bold text-white">Profil</h2></div>
    <section className="relative mb-6 overflow-hidden rounded-3xl border border-slate-700/80 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1c3760] via-[#101b2e] to-[#0a111e] p-6 shadow-2xl shadow-black/20 sm:p-9">
      <div className="pointer-events-none absolute -right-8 -top-24 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" /><div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-sky-300/30 to-transparent" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4"><div className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-2xl border border-sky-300/25 bg-gradient-to-br from-sky-400/20 to-blue-900/30 text-sky-200 shadow-lg shadow-sky-950/30"><UserRound className="h-9 w-9" /></div><div><p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{ownProfile ? 'Personel profili' : 'LSPD personeli'}</p><h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{displayName(profileUser) || 'İsimsiz kullanıcı'}</h3><p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{profileUser.role === 'admin' ? 'Yönetici' : 'Departman personeli'}</p></div></div>
        <button type="button" onClick={likeProfile} disabled={ownProfile || alreadyLiked || liking || commentsLoading || Boolean(commentsError)} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed ${alreadyLiked ? 'border-rose-400/30 bg-rose-400/10 text-rose-300' : 'border-slate-700 bg-slate-950/40 text-slate-200 hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-50'}`}><Heart className={`h-5 w-5 ${alreadyLiked ? 'fill-current' : ''}`} />{ownProfile ? 'Beğeni: ' : alreadyLiked ? 'Beğendiniz · ' : liking ? 'Kaydediliyor · ' : 'Beğen · '}{profileLikes.length}</button>
      </div>
    </section>

    <div className="grid gap-4 sm:grid-cols-3">
      <article className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-[#131f33] to-[#0d1626] p-5 shadow-lg shadow-black/10 transition hover:border-amber-300/20"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300"><Shield className="h-5 w-5" /></div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Rütbe</p><p className="mt-2 text-lg font-semibold text-white">{schemaLoading ? 'Yükleniyor…' : rosterEntry?.rank || 'Şemada kayıtlı değil'}</p></article>
      <article className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-[#131f33] to-[#0d1626] p-5 shadow-lg shadow-black/10 transition hover:border-sky-300/20"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300"><BadgeCheck className="h-5 w-5" /></div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Rozet numarası</p><p className="mt-2 font-mono text-xl font-bold text-white">{rosterEntry?.badge_number || '—'}</p></article>
      <article className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-[#131f33] to-[#0d1626] p-5 shadow-lg shadow-black/10 transition hover:border-emerald-300/20"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><Building2 className="h-5 w-5" /></div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Birim</p><p className="mt-2 text-lg font-semibold text-white">{UNIT_LABELS[rosterEntry?.unit] || rosterEntry?.unit || '—'}</p></article>
    </div>

    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1626]"><div className="flex items-center justify-between border-b border-slate-800 px-5 py-5 sm:px-6"><div><h3 className="font-bold text-white">Oluşturduğu dosyalar</h3><p className="mt-1 text-xs text-slate-500">Bu personelin hazırladığı operasyon kayıtları</p></div><span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">{authoredFiles.length}</span></div><div className="divide-y divide-slate-800">{caseFilesLoading ? <p className="p-6 text-center text-sm text-slate-400">Dosyalar yükleniyor…</p> : caseFilesError ? <p role="alert" className="p-5 text-sm text-red-300">Dosyalar yüklenemedi: {caseFilesError}</p> : authoredFiles.length ? authoredFiles.map((file) => <button type="button" key={file.id} onClick={() => onOpenCaseFile(file)} className="group flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-800/40"><div><p className="font-semibold text-white group-hover:text-sky-200">{file.title || file.documentType || 'Dosya'}</p><p className="mt-1 text-xs text-slate-500">{file.caseId || '—'} · {file.date || (file.createdAt ? new Date(file.createdAt).toLocaleDateString('tr-TR') : 'Tarih yok')} · {file.documentType || 'Belge'}</p></div><div className="flex items-center gap-3"><span className="rounded-full border border-slate-700 bg-slate-950/40 px-2.5 py-1 text-[10px] font-bold text-slate-300">{file.status || 'Kayıtlı'}</span><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300"><Eye className="h-4 w-4" /> Aç / İncele</span></div></button>) : <div className="px-5 py-9 text-center text-sm text-slate-500">Henüz dosya oluşturulmamış.</div>}</div></section>

    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1626]">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5 sm:px-6"><div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-400/10 text-violet-300"><MessageSquareText className="h-5 w-5" /></div><div><h3 className="font-bold text-white">Personel yorumları</h3><p className="text-xs text-slate-500">{profileComments.length} yorum</p></div></div>
      <div className={`grid gap-6 p-5 sm:p-6 ${ownProfile ? 'lg:grid-cols-1' : 'lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]'}`}>
        <div className="space-y-3">
          {commentsLoading ? <p className="py-8 text-center text-sm text-slate-400">Yorumlar yükleniyor…</p> : commentsError ? <p role="alert" className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">Yorumlar yüklenemedi: {commentsError}</p> : profileComments.length ? profileComments.map((item) => {
            const author = users.find((person) => String(person.id) === String(item.author_id))
            return <article key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div>{author ? <button type="button" onClick={() => onOpenProfile(author.id)} className="font-semibold text-sky-300 hover:text-sky-200 hover:underline">{displayName(author)}</button> : <p className="font-semibold text-white">LSPD personeli</p>}<p className="mt-0.5 text-xs text-slate-500">{item.created_at ? new Date(item.created_at).toLocaleString('tr-TR') : ''}</p></div></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{item.comment}</p></article>
          }) : <div className="rounded-xl border border-dashed border-slate-700 px-4 py-10 text-center"><MessageSquareText className="mx-auto h-7 w-7 text-slate-600" /><p className="mt-3 text-sm font-medium text-slate-300">Henüz yorum yazılmamış</p><p className="mt-1 text-xs text-slate-500">İlk yorumu siz yazabilirsiniz.</p></div>}
        </div>
        {!ownProfile && <form onSubmit={submit} className="self-start rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5"><h4 className="font-semibold text-white">Yorum yaz</h4><p className="mt-1 text-xs text-slate-500">Yorumunuz {displayName(profileUser)} profilinde görünecek.</p><label className="mt-4 block text-xs font-semibold text-slate-300">Yorum<textarea required maxLength={1000} rows={5} value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Bu personel hakkında yorumunuzu yazın…" className={`${fieldClass} mt-1.5 resize-y`} /></label>{formError && <p role="alert" className="mt-3 text-sm text-red-300">{formError}</p>}{notice && <p role="status" className="mt-3 text-sm text-emerald-300">{notice}</p>}<button disabled={sending || !commentText.trim()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"><Send className="h-4 w-4" />{sending ? 'Gönderiliyor…' : 'Yorumu gönder'}</button></form>}
        {formError && ownProfile && <p role="alert" className="text-sm text-red-300">{formError}</p>}{notice && ownProfile && <p role="status" className="text-sm text-emerald-300">{notice}</p>}
      </div>
    </section>
  </main>
}
