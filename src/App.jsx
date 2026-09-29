import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Archive, BookOpen, FilePlus2, Home, LogOut, Pencil, Radio, Shield, UserRound, Users } from 'lucide-react'
import FormPanel from './components/FormPanel'
import DocumentPreview from './components/DocumentPreview'
import RiceBadge from './components/RiceBadge'
import SplashScreen from './components/SplashScreen'
import HomeScreen from './components/HomeScreen'
import ArchivePanel from './components/ArchivePanel'
import Toast from './components/Toast'
import { exportNodeToPng } from './lib/exportImage'
import { deleteCaseFile, fromApiCaseFile, listCaseFiles, saveCaseFile, toApiCaseFile, updateCaseFile, updateCaseFileStatus } from './lib/caseFilesApi'
import { fileToDataUrl, generateCaseId, nowParts, uid } from './lib/helpers'
import { DOC_TYPES, STATUS_OPTIONS } from './constants'
import LoginScreen from './components/LoginScreen'
import { createUser, deleteUser, listUsers, updateUser } from './lib/usersApi'
import SchemaPanel from './components/SchemaPanel'
import { addRosterMember, deleteRosterMember, getSchema, updateRosterMember } from './lib/schemaApi'
import ProfilePanel from './components/ProfilePanel'
import AdminPanel from './components/AdminPanel'
import HandbookPanel from './components/HandbookPanel'
import CodesPanel from './components/CodesPanel'

function createInitialForm() {
  const { date, time } = nowParts()
  return { docType: DOC_TYPES[0].value, caseId: generateCaseId(), date, time, officerName: '', badgeNumber: '', suspects: '', sectionTitle: '', narrative: '', charges: '', status: STATUS_OPTIONS[0].value }
}

export default function App() {
  const initial = useMemo(createInitialForm, [])
  const [form, setForm] = useState(initial), [evidence, setEvidence] = useState([]), [view, setView] = useState('home')
  const [splashLeaving, setSplashLeaving] = useState(false), [showSplash, setShowSplash] = useState(true)
  const [busy, setBusy] = useState(false), [saving, setSaving] = useState(false), [archive, setArchive] = useState([])
  const [archiveLoading, setArchiveLoading] = useState(false), [archiveError, setArchiveError] = useState(''), [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editingProfileId, setEditingProfileId] = useState(null)
  const [toast, setToast] = useState(''), [clearAfterSave, setClearAfterSave] = useState(false)
  const previewRef = useRef(null)
  const [user, setUser] = useState(null)
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState('')
  const [users, setUsers] = useState([])
  const [schema, setSchema] = useState(null)
  const [schemaLoading, setSchemaLoading] = useState(false)
  const [schemaError, setSchemaError] = useState('')
  const [profileTargetId, setProfileTargetId] = useState(null)
  const [profileTargetName, setProfileTargetName] = useState('')

  useEffect(() => {
    let active = true
    const sessionId = sessionStorage.getItem('pd-user-id')
    listUsers().then((users) => {
      if (!active) return
      setUsers(users)
      const sessionUser = users.find((item) => String(item.id) === sessionId)
      if (sessionUser) setUser(sessionUser)
      else sessionStorage.removeItem('pd-user-id')
    }).catch(() => { if (active) setAuthError('API bağlantısı kurulamadı. Lütfen yeniden deneyin.') })
    return () => { active = false }
  }, [])

  const login = async ({ firstName, lastName, password }) => {
    setAuthBusy(true); setAuthError('')
    try {
      const users = await listUsers()
      setUsers(users)
      const match = users.find((item) => item.firstName?.toLowerCase() === firstName.toLowerCase() && item.lastName?.toLowerCase() === lastName.toLowerCase() && item.password === password)
      if (!match) { setAuthError('Ad, soyad veya şifre hatalı.'); return }
      sessionStorage.setItem('pd-user-id', match.id); setUser(match)
    } catch (error) { setAuthError(`Giriş yapılamadı: ${error.message}`) }
    finally { setAuthBusy(false) }
  }


  useEffect(() => { const a = setTimeout(() => setSplashLeaving(true), 1600), b = setTimeout(() => setShowSplash(false), 2150); return () => { clearTimeout(a); clearTimeout(b) } }, [])
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer) }, [toast])
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const loadArchive = async () => { setArchiveLoading(true); setArchiveError(''); try { setArchive(await listCaseFiles()) } catch (error) { setArchiveError(`Arşiv yüklenemedi: ${error.message}`) } finally { setArchiveLoading(false) } }
  const loadSchema = async () => { setSchemaLoading(true); setSchemaError(''); try { const [nextSchema, nextUsers] = await Promise.all([getSchema(), listUsers()]); setSchema(nextSchema); setUsers(nextUsers); return nextSchema } catch (error) { setSchemaError(`Şema yüklenemedi: ${error.message}`); return null } finally { setSchemaLoading(false) } }
  const navigate = async (next) => {
    setView(next)
    if (next === 'archive') loadArchive()
    if (next === 'profile') { setProfileTargetId(String(user?.id || '')); setProfileTargetName('') }
    let currentSchema = schema
    if ((next === 'schema' || next === 'profile' || next === 'create') && !currentSchema) currentSchema = await loadSchema()
    if (next === 'create') {
      const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
      const entry = currentSchema?.roster?.find((item) => item.user_name?.trim().toLocaleLowerCase('tr-TR') === name.toLocaleLowerCase('tr-TR'))
      setEditingId(null); setEditingProfileId(null)
      setForm((current) => ({ ...current, officerName: name, badgeNumber: entry?.badge_number || '' }))
    }
  }
  const openProfile = (userId, name = '') => { setProfileTargetId(String(userId)); setProfileTargetName(name); setView('profile'); if (!schema) loadSchema() }
  const addSchemaMember = async (member) => { if (user?.role !== 'admin') throw new Error('Bu işlem yalnızca yöneticiler içindir.'); if (!schema) throw new Error('Şema henüz yüklenmedi.'); const updated = await addRosterMember(schema, member); setSchema(updated); setToast('Personel şemaya eklendi.') }
  const removeSchemaMember = async (memberId) => { if (user?.role !== 'admin') throw new Error('Bu işlem yalnızca yöneticiler içindir.'); if (!schema) throw new Error('Şema yüklenmedi.'); const updated = await deleteRosterMember(schema, memberId); setSchema(updated); setToast('Personel şemadan kaldırıldı.') }
  const editSchemaMember = async (memberId, changes) => { if (user?.role !== 'admin') throw new Error('Bu işlem yalnızca yöneticiler içindir.'); if (!schema) throw new Error('Şema yüklenmedi.'); const updated = await updateRosterMember(schema, memberId, changes); setSchema(updated); setToast('Personel bilgileri güncellendi.') }
  const createManagedUser = async ({ firstName, lastName, password }) => { if (user?.role !== 'admin') throw new Error('Bu işlem yalnızca yöneticiler içindir.'); const freshUsers = await listUsers(); if (freshUsers.some((item) => item.firstName?.trim().toLocaleLowerCase('tr-TR') === firstName.trim().toLocaleLowerCase('tr-TR') && item.lastName?.trim().toLocaleLowerCase('tr-TR') === lastName.trim().toLocaleLowerCase('tr-TR'))) throw new Error('Bu ad ve soyadla bir hesap zaten mevcut.'); const created = await createUser({ firstName: firstName.trim(), lastName: lastName.trim(), password, role: 'user' }); setUsers((current) => [...current, created]) }
  const removeManagedUser = async (person) => { if (user?.role !== 'admin') throw new Error('Bu işlem yalnızca yöneticiler içindir.'); if (String(person.id) === String(user.id)) throw new Error('Kendi hesabınızı silemezsiniz.'); await deleteUser(person.id); setUsers((current) => current.filter((item) => String(item.id) !== String(person.id))) }
  const changePassword = async (currentPassword, newPassword) => {
    const freshUsers = await listUsers()
    const freshUser = freshUsers.find((item) => String(item.id) === String(user.id))
    if (!freshUser || freshUser.password !== currentPassword) throw new Error('Mevcut şifre yanlış.')
    const updated = await updateUser(user.id, { password: newPassword })
    setUser(updated); setUsers((items) => items.map((item) => String(item.id) === String(updated.id) ? updated : item))
  }
  const addFiles = async (fileList) => { const images = Array.from(fileList || []).filter((file) => file.type.startsWith('image/')); if (!images.length) return; const items = await Promise.all(images.map(async (file) => ({ id: uid(), src: await fileToDataUrl(file), caption: '', name: file.name }))); setEvidence((previous) => [...previous, ...items]) }
  const startNewFile = () => { setForm({ ...createInitialForm(), officerName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(), badgeNumber: schema?.roster?.find((item) => item.user_name?.trim().toLocaleLowerCase('tr-TR') === `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toLocaleLowerCase('tr-TR'))?.badge_number || '' }); setEvidence([]); setEditingId(null); setEditingProfileId(null) }
  const saveToSystem = async () => {
    setSaving(true)
    try {
      const payload = await toApiCaseFile(form, evidence, editingProfileId || user.id)
      if (editingId) await updateCaseFile(editingId, payload)
      else await saveCaseFile(payload)
      return true
    } catch (error) {
      if (error.status === 413) {
        alert('Yüklenen görseller çok büyük. Daha küçük bir görsel yükleyin veya görseli kaldırıp yeniden deneyin.')
      } else {
        alert(`Dosya kaydedilemedi: ${error.message}`)
      }
      return false
    } finally {
      setSaving(false)
    }
  }
  const handleSave = async () => { const saved = await saveToSystem(); if (!saved) return; setToast(editingId ? 'Dosya başarıyla güncellendi!' : 'Dosya sisteme kaydedildi!'); if (clearAfterSave) startNewFile() }
  const handleDownload = async () => { const saved = await saveToSystem(); if (!saved) return; setBusy(true); try { await exportNodeToPng(previewRef.current, `${form.caseId || 'LSPD-DOSYA'}.png`); setToast('Dosya indirildi!') } catch (error) { console.error(error); alert('PNG oluşturulurken bir hata oluştu.') } finally { setBusy(false) } }
  const openCaseFile = (file) => { const loaded = fromApiCaseFile(file); setForm(loaded.form); setEvidence(loaded.evidence); setEditingId(file.id); setEditingProfileId(file.profil_id || null); setView('inspect') }
  const removeCaseFile = async (file) => { if (!window.confirm(`${file.caseId || 'Bu dosya'} kalıcı olarak silinsin mi?`)) return; setDeletingId(file.id); try { await deleteCaseFile(file.id); setArchive((current) => current.filter((item) => item.id !== file.id)) } catch (error) { alert(`Dosya silinemedi: ${error.message}`) } finally { setDeletingId(null) } }
  const changeCaseFileStatus = async (file, status) => {
    if (status === file.status) return
    setUpdatingId(file.id)
    try {
      const updated = await updateCaseFileStatus(file.id, status)
      setArchive((current) => current.map((item) => item.id === file.id ? { ...item, ...updated, status } : item))
      setToast('Dosya durumu güncellendi!')
    } catch (error) {
      alert(`Dosya durumu güncellenemedi: ${error.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  if (!user) return <><LoginScreen onLogin={login} busy={authBusy} error={authError} />{showSplash && <SplashScreen leaving={splashLeaving} />}</>

  return <div className="app-shell min-h-screen bg-[#06101f]">
    {showSplash && <SplashScreen leaving={splashLeaving} />}
    <Toast message={toast} onClose={() => setToast('')} />
    <header className="site-header"><div className="site-header-inner">
      <button onClick={() => navigate('home')} className="site-brand"><RiceBadge className="h-14 w-14 shrink-0" /><span><strong>WYBE - <em>LSPD</em></strong><small>LOS SANTOS POLICE DEPARTMENT</small></span></button>
      <nav className="site-nav" aria-label="Ana gezinme">{[['home', Home, 'Ana Sayfa'], ['create', FilePlus2, 'Dosya Oluştur'], ['archive', Archive, 'Arşiv'], ['schema', Users, 'Şema'], ['codes', Radio, 'Kodlar'], ['handbook', BookOpen, 'El Kitapçığı'], ...(user.role === 'admin' ? [['admin', Shield, 'Yönetim']] : [])].map(([id, Icon, label]) => <button key={id} onClick={() => navigate(id)} className={view === id ? 'selected' : ''}><Icon className="h-4 w-4" /><span>{label}</span></button>)}</nav>
      <div className="account-actions"><span className="account-label">{user.firstName} · {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}</span><button type="button" onClick={() => navigate('profile')} className={`account-profile ${view === 'profile' ? 'selected' : ''}`}><UserRound className="h-4 w-4" /><span>Profil</span></button><button title="Çıkış yap" onClick={() => { sessionStorage.removeItem('pd-user-id'); setUser(null); setView('home') }} className="account-logout"><LogOut className="h-4 w-4" /></button></div>
    </div></header>
    {view === 'home' && <HomeScreen onNavigate={navigate} />}
    {view === 'handbook' && <HandbookPanel />}
    {view === 'codes' && <CodesPanel />}
    {view === 'admin' && user.role === 'admin' && <AdminPanel users={users} currentUserId={user.id} onCreateUser={createManagedUser} onDeleteUser={removeManagedUser} onUsersRefresh={async () => setUsers(await listUsers())} />}
    {view === 'schema' && <SchemaPanel schema={schema} loading={schemaLoading} error={schemaError} onRefresh={loadSchema} onAdd={addSchemaMember} onUpdate={editSchemaMember} onDelete={removeSchemaMember} onOpenProfile={openProfile} users={users} currentUser={user} isAdmin={user.role === 'admin'} />}
    {view === 'profile' && <ProfilePanel users={users} currentUser={user} profileUserId={profileTargetId || user.id} profileName={profileTargetName} onOpenProfile={openProfile} onOpenCaseFile={openCaseFile} schema={schema} schemaLoading={schemaLoading} onChangePassword={changePassword} />}
    {view === 'archive' && <ArchivePanel files={archive} loading={archiveLoading} error={archiveError} onRefresh={loadArchive} onOpen={openCaseFile} onDelete={removeCaseFile} onStatusChange={changeCaseFileStatus} deletingId={deletingId} updatingId={updatingId} isAdmin={user.role === 'admin'} />}
    {view === 'inspect' && <main className="mx-auto max-w-[1000px] p-4 sm:p-6"><div className="mb-4 flex items-center justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#1680ff]">Dosya İnceleme</p><h2 className="mt-1 text-xl font-bold text-white">{form.caseId || 'Dosya'}</h2></div>{user.role === 'admin' && <button onClick={() => setView('create')} className="inline-flex items-center gap-2 rounded-md border border-[#1680ff]/60 bg-[#1680ff]/10 px-4 py-2 text-sm font-bold text-[#1680ff] transition hover:bg-[#1680ff]/20"><Pencil className="h-4 w-4" /> Düzenle</button>}</div><section className="overflow-auto rounded-lg border border-slate-800 bg-[#060a12] p-4 sm:p-8" style={{ backgroundImage: 'radial-gradient(#141c2c 1px, transparent 1px)', backgroundSize: '18px 18px' }}><div className="mx-auto w-fit"><DocumentPreview form={form} evidence={evidence} /></div></section></main>}
    {view === 'create' && <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 p-4 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:p-6"><FormPanel form={form} setField={setField} onRegenerateId={() => setField('caseId', generateCaseId())} evidence={evidence} addFiles={addFiles} updateCaption={(id, caption) => setEvidence((current) => current.map((item) => item.id === id ? { ...item, caption } : item))} removeEvidence={(id) => setEvidence((current) => current.filter((item) => item.id !== id))} onDownload={handleDownload} onSave={handleSave} onNewFile={startNewFile} busy={busy} saving={saving} clearAfterSave={clearAfterSave} setClearAfterSave={setClearAfterSave} isEditing={Boolean(editingId)} /><section className="min-w-0"><div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">CANLI ÖNİZLEME</span><span className="text-[11px] text-slate-500">~2460 px genişlik · PNG · 3×</span></div><div className="overflow-auto rounded-lg border border-slate-800 bg-[#060a12] p-4 lg:p-8" style={{ backgroundImage: 'radial-gradient(#141c2c 1px, transparent 1px)', backgroundSize: '18px 18px' }}><div className="mx-auto w-fit"><DocumentPreview ref={previewRef} form={form} evidence={evidence} /></div></div></section></main>}
  </div>
}
