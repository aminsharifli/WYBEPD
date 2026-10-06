import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Archive, Bell, BookOpen, FilePlus2, Home, LogOut, Menu, Megaphone, Pencil, Radio, Settings2, Shield, UserRound, Users, X } from 'lucide-react'
import FormPanel from './components/FormPanel'
import DocumentPreview from './components/DocumentPreview'
import RiceBadge from './components/RiceBadge'
import SplashScreen from './components/SplashScreen'
import HomeScreen from './components/HomeScreen'
import ArchivePanel from './components/ArchivePanel'
import Toast from './components/Toast'
import { exportNodeToPng } from './lib/exportImage'
import { deleteCaseFile, fromApiCaseFile, listCaseFiles, saveCaseFile, toApiCaseFile, updateCaseFileRecord } from './lib/caseFilesApi'
import { fileToDataUrl, formatTurkeyDateTime, generateCaseId, nowParts, uid } from './lib/helpers'
import { DOC_TYPES, STATUS_OPTIONS } from './constants'
import LoginScreen from './components/LoginScreen'
import { createUser, deleteUser, listUsers, updateUser } from './lib/usersApi'
import SchemaPanel from './components/SchemaPanel'
import { addRosterMember, deleteRosterMember, getSchema, updateRosterMember } from './lib/schemaApi'
import ProfilePanel from './components/ProfilePanel'
import AdminPanel from './components/AdminPanel'
import HandbookPanel from './components/HandbookPanel'
import CodesPanel from './components/CodesPanel'
import NotificationsPanel from './components/NotificationsPanel'
import HeaderSettingsPanel from './components/HeaderSettingsPanel'
import AnnouncementComposer from './components/AnnouncementComposer'
import { createAnnouncement, deleteComment, listAnnouncements } from './lib/commentsApi'

function createInitialForm() {
  const { date, time } = nowParts()
  return { docType: DOC_TYPES[0].value, caseId: generateCaseId(), date, time, officerName: '', badgeNumber: '', suspects: '', sectionTitle: '', narrative: '', charges: '', status: STATUS_OPTIONS[0].value }
}

const compactMentionName = (value) => String(value || '').replace(/[^\p{L}\p{N}_]/gu, '')

export default function App() {
  const initial = useMemo(createInitialForm, [])
  const [form, setForm] = useState(initial), [evidence, setEvidence] = useState([]), [view, setView] = useState('home')
  const [splashLeaving, setSplashLeaving] = useState(false), [showSplash, setShowSplash] = useState(true)
  const [busy, setBusy] = useState(false), [saving, setSaving] = useState(false), [archive, setArchive] = useState([])
  const [archiveLoading, setArchiveLoading] = useState(false), [archiveError, setArchiveError] = useState(''), [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editingProfileId, setEditingProfileId] = useState(null)
  const [inspectedFile, setInspectedFile] = useState(null)
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [announcementOpen, setAnnouncementOpen] = useState(false)
  const headerActionsRef = useRef(null)
  const [announcements, setAnnouncements] = useState([])
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('pd-site-theme') || 'original'
    } catch { return 'original' }
  })
  const [seenApprovals, setSeenApprovals] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`pd-seen-approvals-${sessionStorage.getItem('pd-user-id')}`) || '[]') } catch { return [] }
  })
  const [notificationSeenAt, setNotificationSeenAt] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`pd-notification-seen-${sessionStorage.getItem('pd-user-id')}`) || '{}') } catch { return {} }
  })
  const currentRosterEntry = schema?.roster?.find((item) => item.user_name?.trim().toLocaleLowerCase('tr-TR') === `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toLocaleLowerCase('tr-TR'))
  const currentRank = currentRosterEntry?.rank || ''
  const canEditCaseFiles = user?.role === 'admin' || ['Dedektif', 'Kıdemli Dedektif'].includes(currentRank) || ['Polis Şefi', 'Polis Şefi Yardımcısı', 'Binbaşı', 'Yüzbaşı', 'Kıdemli Teğmen', 'Teğmen'].includes(currentRank)
  const canChangeCaseFileStatus = user?.role === 'admin' || ['Polis Şefi', 'Polis Şefi Yardımcısı', 'Binbaşı', 'Yüzbaşı', 'Kıdemli Teğmen', 'Teğmen'].includes(currentRank)
  const canApproveCaseFiles = canChangeCaseFileStatus
  const canSendAnnouncements = user?.role === 'admin' || ['Çavuş', 'Çavuş (Dedektif)', 'Dedektif', 'Kıdemli Çavuş', 'Kıdemli Dedektif', 'Teğmen', 'Kıdemli Teğmen', 'Yüzbaşı', 'Binbaşı', 'Polis Şefi Yardımcısı', 'Polis Şefi'].includes(currentRank)
  const canEditInspectedFile = canEditCaseFiles || String(inspectedFile?.profil_id) === String(user?.id)

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
      try {
        setSeenApprovals(JSON.parse(localStorage.getItem(`pd-seen-approvals-${match.id}`) || '[]'))
        setNotificationSeenAt(JSON.parse(localStorage.getItem(`pd-notification-seen-${match.id}`) || '{}'))
      } catch { setSeenApprovals([]); setNotificationSeenAt({}) }
      sessionStorage.setItem('pd-user-id', match.id); setUser(match)
    } catch (error) { setAuthError(`Giriş yapılamadı: ${error.message}`) }
    finally { setAuthBusy(false) }
  }


  useEffect(() => { const a = setTimeout(() => setSplashLeaving(true), 1600), b = setTimeout(() => setShowSplash(false), 2150); return () => { clearTimeout(a); clearTimeout(b) } }, [])
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer) }, [toast])
  useEffect(() => {
    const closeHeaderPopovers = (event) => { if (!headerActionsRef.current?.contains(event.target)) { setNotificationsOpen(false); setSettingsOpen(false) } }
    const closeOnEscape = (event) => { if (event.key === 'Escape') { setNotificationsOpen(false); setSettingsOpen(false) } }
    document.addEventListener('pointerdown', closeHeaderPopovers)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('pointerdown', closeHeaderPopovers); document.removeEventListener('keydown', closeOnEscape) }
  }, [])
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const loadArchive = async () => { setArchiveLoading(true); setArchiveError(''); try { const files = await listCaseFiles(); setArchive(files); return files } catch (error) { setArchiveError(`Arşiv yüklenemedi: ${error.message}`); return [] } finally { setArchiveLoading(false) } }
  useEffect(() => {
    if (!user) return undefined
    const refreshQuietly = () => {
      if (document.visibilityState !== 'visible') return
      Promise.all([listCaseFiles(), listAnnouncements()]).then(([files, posts]) => { setArchive(files); setAnnouncements(posts) }).catch(() => {})
    }
    const timer = window.setInterval(refreshQuietly, 5000)
    window.addEventListener('focus', refreshQuietly)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refreshQuietly) }
  }, [user?.id])
  const loadSchema = async () => { setSchemaLoading(true); setSchemaError(''); try { const [nextSchema, nextUsers] = await Promise.all([getSchema(), listUsers()]); setSchema(nextSchema); setUsers(nextUsers); return nextSchema } catch (error) { setSchemaError(`Şema yüklenemedi: ${error.message}`); return null } finally { setSchemaLoading(false) } }
  useEffect(() => { if (user && !schema) loadSchema() }, [user])
  useEffect(() => { if (user) loadArchive() }, [user])
  useEffect(() => { if (user) listAnnouncements().then(setAnnouncements).catch(() => {}) }, [user])
  const notifications = useMemo(() => {
    const items = announcements.map((post) => {
      let mentions = Array.isArray(post.mentions) ? post.mentions : []
      if (!mentions.length && typeof post.mentions === 'string') {
        try { const parsed = JSON.parse(post.mentions); if (Array.isArray(parsed)) mentions = parsed } catch {}
      }
      if (!mentions.length && schema?.roster) mentions = schema.roster.flatMap((member) => {
        const displayName = String(member.user_name || '').trim()
        const tag = compactMentionName(displayName)
        if (!tag || !(post.comment || '').includes(`@${tag}`)) return []
        const target = users.find((entry) => `${entry.firstName || ''} ${entry.lastName || ''}`.trim().toLocaleLowerCase('tr-TR') === displayName.toLocaleLowerCase('tr-TR'))
        return [{ tag, displayName, userId: target?.id ?? `roster-${member.id}` }]
      })
      return { id: `announcement-${post.id}`, postId: post.id, authorId: String(post.author_id || ''), canDelete: user?.role === 'admin' || String(post.author_id) === String(user?.id), type: 'announcement', text: post.comment || '', file: null, mentions, authorName: post.author_name, at: post.created_at }
    })
    for (const file of archive) {
      const history = Array.isArray(file.activityHistory) ? file.activityHistory : []
      history.forEach((entry, index) => {
        const isOwner = String(file.profil_id) === String(user?.id)
        if (canApproveCaseFiles && !isOwner && entry.type === 'created') items.push({ id: `new-file-${file.id}`, type: 'pending', file, text: `Yeni dosya oluşturuldu: ${file.caseId || file.title || 'Dosya'}`, at: entry.at || file.createdAt })
        if (isOwner && entry.type === 'approved' && String(entry.actorId) !== String(user?.id)) items.push({ id: `approved-${file.id}-${index}`, type: 'approved', file, text: `Dosyanız onaylandı: ${file.caseId || 'Dosya'}`, at: entry.at })
        if (isOwner && entry.type === 'rejected' && String(entry.actorId) !== String(user?.id)) items.push({ id: `rejected-${file.id}-${index}`, type: 'rejected', file, text: `Dosyanız reddedildi: ${file.caseId || 'Dosya'}`, at: entry.at })
        if (isOwner && entry.type === 'issue_reported' && String(entry.actorId) !== String(user?.id)) items.push({ id: `issue-${file.id}-${index}`, type: 'issue', file, text: `${file.caseId || 'Dosya'} için sorun bildirildi`, at: entry.at })
        const pairedAction = index > 0 && history[index - 1].at === entry.at && ['approved', 'rejected', 'issue_reported'].includes(history[index - 1].type)
        if (isOwner && entry.type === 'status_changed' && !pairedAction && String(entry.actorId) !== String(user?.id)) items.push({ id: `status-${file.id}-${index}`, type: 'issue', file, text: `${file.caseId || 'Dosya'} durumu değiştirildi`, at: entry.at })
      })
    }
    const now = Date.now()
    return items.filter((item) => !notificationSeenAt[item.id] || now - notificationSeenAt[item.id] < 60 * 60 * 1000).sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0)).map((item) => ({ ...item, readAt: notificationSeenAt[item.id] || null }))
  }, [announcements, archive, canApproveCaseFiles, notificationSeenAt, schema?.roster, users, user?.id])
  const unreadNotificationCount = notifications.reduce((count, item) => count + (item.readAt ? 0 : 1), 0)
  const approvedAnnouncementCount = archive.filter((file) => file.amirApproval && !file.rejected && !seenApprovals.includes(String(file.id))).length
  const navigate = async (next) => {
    setMobileMenuOpen(false)
    setView(next)
    if (next === 'archive') {
      const files = await loadArchive()
      const ids = files.filter((file) => file.amirApproval && !file.rejected).map((file) => String(file.id))
      const seen = [...new Set([...seenApprovals, ...ids])]
      setSeenApprovals(seen)
      localStorage.setItem(`pd-seen-approvals-${user.id}`, JSON.stringify(seen))
    }
    if (next === 'profile') { setProfileTargetId(String(user?.id || '')); setProfileTargetName('') }
    let currentSchema = schema
    if ((next === 'schema' || next === 'profile' || next === 'create' || next === 'archive') && !currentSchema) currentSchema = await loadSchema()
    if (next === 'create') {
      // Arşivden açılmış bir kayıttan yeni dosyaya geçerken kayıtlı içeriği
      // taslağa taşımayın. Aynı ekrandaki taslak gezinti boyunca korunur.
      if (editingId) {
        startNewFile()
        return
      }
      const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
      const entry = currentSchema?.roster?.find((item) => item.user_name?.trim().toLocaleLowerCase('tr-TR') === name.toLocaleLowerCase('tr-TR'))
      setEditingId(null); setEditingProfileId(null)
      setForm((current) => ({ ...current, officerName: name, badgeNumber: entry?.badge_number || '', status: user?.role === 'admin' ? current.status : 'ONAY BEKLİYOR' }))
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
  const startNewFile = () => { setForm({ ...createInitialForm(), status: user?.role === 'admin' ? STATUS_OPTIONS[0].value : 'ONAY BEKLİYOR', officerName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(), badgeNumber: schema?.roster?.find((item) => item.user_name?.trim().toLocaleLowerCase('tr-TR') === `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toLocaleLowerCase('tr-TR'))?.badge_number || '' }); setEvidence([]); setEditingId(null); setEditingProfileId(null) }
  const saveToSystem = async () => {
    setSaving(true)
    try {
      const savedForm = user.role === 'admin' || editingId ? form : { ...form, status: 'ONAY BEKLİYOR' }
      const payload = await toApiCaseFile(savedForm, evidence, editingProfileId || user.id)
      if (editingId) {
        const previous = inspectedFile || archive.find((item) => String(item.id) === String(editingId)) || {}
        const history = Array.isArray(previous.activityHistory) ? previous.activityHistory : []
        const now = new Date().toISOString()
        const issueWasReported = Boolean(previous.issueReport)
        const nextStatus = issueWasReported ? 'ONAY BEKLİYOR' : payload.status
        const statusChanged = Boolean(previous.status && previous.status !== nextStatus)
        const activityHistory = [
          ...history,
          { type: 'edited', actor: `${user.firstName} ${user.lastName}`.trim(), actorId: String(user.id), at: now, details: issueWasReported ? 'Sorun bildirimi sonrası dosya düzenlendi.' : 'Dosya güncellendi.' },
          ...(statusChanged ? [{ type: 'status_changed', actor: `${user.firstName} ${user.lastName}`.trim(), actorId: String(user.id), at: now, details: `Durum ${previous.status || '—'} → ${nextStatus} olarak değiştirildi.` }] : []),
        ]
        const changes = {
          ...payload,
          createdAt: previous.createdAt || payload.createdAt,
          activityHistory,
          ...(issueWasReported ? { issueReport: '', issueReportedBy: '', issueReportedAt: '', rejected: false, rejectedBy: '', rejectedAt: '', rejectionReason: '', amirApproval: '', status: 'ONAY BEKLİYOR' } : {}),
        }
        const updated = await updateCaseFileRecord(editingId, changes)
        setInspectedFile(updated)
        setArchive((items) => items.map((item) => String(item.id) === String(editingId) ? updated : item))
        setForm((current) => ({ ...current, ...(issueWasReported ? { issueReport: '', issueReportedBy: '', issueReportedAt: '', rejected: false, rejectedBy: '', rejectedAt: '', rejectionReason: '', amirApproval: '', status: 'ONAY BEKLİYOR' } : {}) }))
      } else {
        const now = new Date().toISOString()
        const created = await saveCaseFile({ ...payload, createdAt: now, activityHistory: [{ type: 'created', actor: `${user.firstName} ${user.lastName}`.trim(), actorId: String(user.id), at: now, details: 'Dosya oluşturuldu.' }] })
        setArchive((items) => [created, ...items])
      }
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
  const handleDownload = async () => {
    setBusy(true)
    try {
      await exportNodeToPng(previewRef.current, `${form.caseId || 'LSPD-DOSYA'}.png`)
      const saved = await saveToSystem()
      if (saved) setToast('PNG indirildi ve dosya sisteme kaydedildi.')
    } catch (error) { console.error(error); alert(`PNG oluşturulamadı: ${error.message || 'Bilinmeyen hata.'}`) }
    finally { setBusy(false) }
  }
  const openCaseFile = (file) => { const loaded = fromApiCaseFile(file); setForm(loaded.form); setEvidence(loaded.evidence); setEditingId(file.id); setEditingProfileId(file.profil_id || null); setInspectedFile(file); setView('inspect') }
  const removeCaseFile = async (file) => { if (!window.confirm(`${file.caseId || 'Bu dosya'} kalıcı olarak silinsin mi?`)) return; setDeletingId(file.id); try { await deleteCaseFile(file.id); setArchive((current) => current.filter((item) => item.id !== file.id)) } catch (error) { alert(`Dosya silinemedi: ${error.message}`) } finally { setDeletingId(null) } }
  const changeCaseFileStatus = async (file, status) => {
    if (!canChangeCaseFileStatus) return
    if (status === file.status) return
    setUpdatingId(file.id)
    try {
      const now = new Date().toISOString()
      const updated = await updateCaseFileRecord(file.id, { status, activityHistory: [...(file.activityHistory || []), { type: 'status_changed', actor: `${user.firstName} ${user.lastName}`.trim(), actorId: String(user.id), at: now, details: `Durum ${file.status || '—'} → ${status} olarak değiştirildi.` }] })
      setArchive((current) => current.map((item) => item.id === file.id ? updated : item))
      setToast('Dosya durumu güncellendi!')
    } catch (error) {
      alert(`Dosya durumu güncellenemedi: ${error.message}`)
    } finally {
      setUpdatingId(null)
    }
  }
  const recordApprovalAction = async (file, action, details = '') => {
    if (!canApproveCaseFiles) return
    setUpdatingId(file.id)
    const actor = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    const now = new Date().toISOString()
    const history = Array.isArray(file.activityHistory) ? file.activityHistory : []
    let changes
    if (action === 'approve') {
      if (file.amirApproval || file.rejected) return setUpdatingId(null)
      changes = { amirApproval: actor, approvedAt: now, rejected: false, status: 'AÇIK', issueReport: '', issueReportedBy: '', issueReportedAt: '', activityHistory: [...history, { type: 'approved', actor, actorId: String(user.id), at: now, details: 'Dosya onaylandı.' }, ...(file.status !== 'AÇIK' ? [{ type: 'status_changed', actor, actorId: String(user.id), at: now, details: `Durum ${file.status || '—'} → AÇIK olarak değiştirildi.` }] : [])] }
    } else if (action === 'reject') {
      if (file.amirApproval || file.rejected) return setUpdatingId(null)
      changes = { amirApproval: '', rejected: true, rejectedBy: actor, rejectedAt: now, rejectionReason: details.trim(), status: 'REDDEDİLDİ', issueReport: '', issueReportedBy: '', issueReportedAt: '', activityHistory: [...history, { type: 'rejected', actor, actorId: String(user.id), at: now, details: details.trim() || 'Dosya gerekçe belirtilmeden reddedildi.' }, ...(file.status !== 'REDDEDİLDİ' ? [{ type: 'status_changed', actor, actorId: String(user.id), at: now, details: `Durum ${file.status || '—'} → REDDEDİLDİ olarak değiştirildi.` }] : [])] }
    } else {
      changes = { amirApproval: '', approvedAt: '', rejected: false, rejectedBy: '', rejectedAt: '', rejectionReason: '', issueReport: details.trim(), issueReportedBy: actor, issueReportedAt: now, status: 'SORUN BİLDİRİLDİ', activityHistory: [...history, { type: 'issue_reported', actor, actorId: String(user.id), at: now, details: details.trim() || 'Sorun için açıklama girilmedi.' }, ...(file.status !== 'SORUN BİLDİRİLDİ' ? [{ type: 'status_changed', actor, actorId: String(user.id), at: now, details: `Durum ${file.status || '—'} → SORUN BİLDİRİLDİ olarak değiştirildi.` }] : [])] }
    }
    try {
      const updated = await updateCaseFileRecord(file.id, changes)
      setArchive((current) => current.map((item) => String(item.id) === String(file.id) ? updated : item))
      if (action === 'approve') {
        const seen = [...new Set([...seenApprovals, String(file.id)])]
        setSeenApprovals(seen)
        try { localStorage.setItem(`pd-seen-approvals-${user.id}`, JSON.stringify(seen)) } catch {}
      }
      setToast(action === 'approve' ? 'Dosya onaylandı; dosya sahibine bildirim gönderildi.' : action === 'reject' ? 'Dosya reddedildi; dosya sahibine bildirim gönderildi.' : 'Sorun bildirildi; dosya sahibine bildirim gönderildi.')
      return true
    } catch (error) { alert(`İşlem tamamlanamadı: ${error.message}`); return false }
    finally { setUpdatingId(null) }
  }
  const openNotification = (item) => {
    setNotificationSeenAt((current) => {
      if (current[item.id]) return current
      const next = { ...current, [item.id]: Date.now() }
      try { localStorage.setItem(`pd-notification-seen-${user.id}`, JSON.stringify(next)) } catch {}
      return next
    })
    if (item.type === 'announcement') { setNotificationsOpen(false); return }
    if (item.type === 'approved') {
      const seen = [...new Set([...seenApprovals, String(item.file.id)])]
      setSeenApprovals(seen)
      try { localStorage.setItem(`pd-seen-approvals-${user.id}`, JSON.stringify(seen)) } catch {}
    }
    setNotificationsOpen(false)
    if (item.type === 'pending') navigate('archive')
    else openCaseFile(item.file)
  }
  const updateTheme = (nextTheme) => {
    setTheme(nextTheme)
    try { localStorage.setItem('pd-site-theme', nextTheme) } catch {}
  }
  const sendAnnouncement = async (comment, mentions) => {
    if (!canSendAnnouncements) throw new Error('Bu işlem için rütbe yetkiniz yok.')
    const created = await createAnnouncement({ comment, mentions, authorId: user.id, authorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() })
    setAnnouncements((current) => [created, ...current])
    setToast('Duyuru tüm personele gönderildi.')
    return true
  }
  const removeAnnouncement = async (item) => {
    if (user?.role !== 'admin' && String(item.authorId) !== String(user?.id)) return
    if (!window.confirm('Bu genel duyuru kalıcı olarak silinsin mi?')) return
    try {
      await deleteComment(item.postId)
      setAnnouncements((current) => current.filter((post) => String(post.id) !== String(item.postId)))
      setToast('Duyuru silindi.')
    } catch (error) { alert(`Duyuru silinemedi: ${error.message}`) }
  }

  if (!user) return <><LoginScreen onLogin={login} busy={authBusy} error={authError} />{showSplash && <SplashScreen leaving={splashLeaving} />}</>

  return <div data-theme={theme} className="app-shell min-h-screen bg-[#06101f]">
    {showSplash && <SplashScreen leaving={splashLeaving} />}
    <Toast message={toast} onClose={() => setToast('')} />
    <header className="site-header"><div className="site-header-inner">
      <button onClick={() => navigate('home')} className="site-brand"><RiceBadge className="h-14 w-14 shrink-0" /><span><strong>WYBE - <em>LSPD</em></strong><small>LOS SANTOS POLICE DEPARTMENT</small></span></button>
      <button type="button" className="mobile-menu-toggle" aria-label={mobileMenuOpen ? 'Menyunu bağla' : 'Menyunu aç'} aria-expanded={mobileMenuOpen} aria-controls="main-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      <nav id="main-navigation" className={`site-nav${mobileMenuOpen ? ' is-open' : ''}`} aria-label="Ana gezinme">{[['home', Home, 'Ana Sayfa'], ['create', FilePlus2, 'Dosya Oluştur'], ['archive', Archive, 'Arşiv'], ['schema', Users, 'Şema'], ['codes', Radio, 'Kodlar'], ['handbook', BookOpen, 'El Kitapçığı'], ...(user.role === 'admin' ? [['admin', Shield, 'Yönetim']] : [])].map(([id, Icon, label]) => <button key={id} onClick={() => navigate(id)} className={view === id ? 'selected' : ''}><Icon className="h-4 w-4" /><span>{label}{id === 'archive' && approvedAnnouncementCount > 0 && <b className="nav-notification-badge">{approvedAnnouncementCount}</b>}</span></button>)}</nav>
      <div className="account-actions" ref={headerActionsRef}><button type="button" onClick={() => { setNotificationsOpen((open) => !open); setSettingsOpen(false) }} aria-label="Bildirimleri aç" aria-expanded={notificationsOpen} className="notification-toggle"><Bell className="h-5 w-5" />{unreadNotificationCount > 0 && <b>{unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}</b>}</button>{notificationsOpen && <NotificationsPanel items={notifications} unreadCount={unreadNotificationCount} onClose={() => setNotificationsOpen(false)} onOpen={openNotification} onDelete={removeAnnouncement} onMention={(person) => openProfile(person.userId, person.displayName)} />}<button type="button" onClick={() => { setSettingsOpen((open) => !open); setNotificationsOpen(false) }} aria-label="Ayarlar" aria-expanded={settingsOpen} className="notification-toggle"><Settings2 className="h-5 w-5" /></button>{settingsOpen && <HeaderSettingsPanel theme={theme} onChange={updateTheme} onClose={() => setSettingsOpen(false)} />}{canSendAnnouncements && <button type="button" onClick={() => { setAnnouncementOpen(true); setNotificationsOpen(false); setSettingsOpen(false) }} aria-label="Herkese duyuru gönder" title="Herkese duyuru gönder" className="announcement-toggle"><Megaphone className="h-5 w-5" /></button>}<button type="button" onClick={() => navigate('profile')} className={`account-profile ${view === 'profile' ? 'selected' : ''}`}><span className="account-avatar"><UserRound className="h-4 w-4" /></span><span className="account-profile-copy"><strong>{user.firstName} {user.lastName}</strong><small>{currentRosterEntry?.rank || (user.role === 'admin' ? 'Yönetici' : 'Akademi Öğrencisi')} · Rozet {currentRosterEntry?.badge_number || '—'}</small></span></button><button title="Çıkış yap" onClick={() => { sessionStorage.removeItem('pd-user-id'); setUser(null); setView('home') }} className="account-logout"><LogOut className="h-4 w-4" /></button></div>
    </div></header>
    {announcementOpen && <AnnouncementComposer roster={schema?.roster || []} users={users} onSend={sendAnnouncement} onClose={() => setAnnouncementOpen(false)} />}
    {view === 'home' && <HomeScreen onNavigate={navigate} />}
    {view === 'handbook' && <HandbookPanel />}
    {view === 'codes' && <CodesPanel />}
    {view === 'admin' && user.role === 'admin' && <AdminPanel users={users} currentUserId={user.id} onCreateUser={createManagedUser} onDeleteUser={removeManagedUser} onUsersRefresh={async () => setUsers(await listUsers())} />}
    {view === 'schema' && <SchemaPanel schema={schema} loading={schemaLoading} error={schemaError} onRefresh={loadSchema} onAdd={addSchemaMember} onUpdate={editSchemaMember} onDelete={removeSchemaMember} onOpenProfile={openProfile} users={users} currentUser={user} isAdmin={user.role === 'admin'} />}
    {view === 'profile' && <ProfilePanel users={users} currentUser={user} profileUserId={profileTargetId || user.id} profileName={profileTargetName} onOpenProfile={openProfile} onOpenCaseFile={openCaseFile} schema={schema} schemaLoading={schemaLoading} onChangePassword={changePassword} />}
    {view === 'archive' && <ArchivePanel files={archive} loading={archiveLoading} error={archiveError} onRefresh={loadArchive} onOpen={openCaseFile} onDelete={removeCaseFile} onStatusChange={changeCaseFileStatus} onAction={recordApprovalAction} deletingId={deletingId} updatingId={updatingId} isAdmin={user.role === 'admin'} canChangeStatus={canChangeCaseFileStatus} canApprove={canApproveCaseFiles} />}
    {view === 'inspect' && <main className="mx-auto max-w-[1500px] p-4 sm:p-6"><div className="mb-4 flex items-center justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#1680ff]">Dosya İnceleme</p><h2 className="mt-1 text-xl font-bold text-white">{form.caseId || 'Dosya'}</h2></div>{canEditInspectedFile && <button onClick={() => setView('create')} className="inline-flex items-center gap-2 rounded-md border border-[#1680ff]/60 bg-[#1680ff]/10 px-4 py-2 text-sm font-bold text-[#1680ff] transition hover:bg-[#1680ff]/20"><Pencil className="h-4 w-4" /> Düzenle</button>}</div><div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]"><section className="min-w-0 overflow-auto rounded-lg border border-slate-800 bg-[#060a12] p-4 sm:p-8" style={{ backgroundImage: 'radial-gradient(#141c2c 1px, transparent 1px)', backgroundSize: '18px 18px' }}><div className="mx-auto w-fit"><DocumentPreview form={form} evidence={evidence} /></div></section><aside className="space-y-4"><section className="rounded-xl border border-slate-800 bg-[#0d1626] p-5"><h3 className="font-bold text-white">Dosya notları</h3>{form.rejected && <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3"><p className="text-xs font-bold uppercase tracking-wider text-red-300">Reddetme nedeni · {form.rejectedBy || 'Yetkili'} · {form.rejectedAt ? formatTurkeyDateTime(form.rejectedAt) : ''}</p><p className="mt-2 whitespace-pre-wrap text-sm text-red-100">{form.rejectionReason || 'Gerekçe belirtilmedi.'}</p></div>}{form.issueReport && <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3"><p className="text-xs font-bold uppercase tracking-wider text-amber-300">Bildirilen sorun · {form.issueReportedBy || 'Yetkili'} · {form.issueReportedAt ? formatTurkeyDateTime(form.issueReportedAt) : ''}</p><p className="mt-2 whitespace-pre-wrap text-sm text-amber-100">{form.issueReport}</p></div>}{!form.rejected && !form.issueReport && <p className="mt-3 text-sm text-slate-500">Bu dosyada ek not bulunmuyor.</p>}</section><section className="rounded-xl border border-slate-800 bg-[#0d1626] p-5"><h3 className="font-bold text-white">İşlem geçmişi</h3><div className="mt-4 space-y-4">{(inspectedFile?.activityHistory || []).length ? [...inspectedFile.activityHistory].reverse().map((entry, index) => <div key={`${entry.at}-${index}`} className="border-l-2 border-slate-700 pl-3"><p className="text-sm font-semibold text-slate-200">{entry.details || entry.type}</p><p className="mt-1 text-xs text-slate-400">{entry.actor || 'Bilinmeyen kullanıcı'} · {entry.at ? formatTurkeyDateTime(entry.at) : 'Tarih yok'}</p></div>) : <p className="text-sm text-slate-500">Henüz işlem kaydı yok.</p>}</div></section></aside></div></main>}
    {view === 'create' && <main className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 p-4 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:p-6"><FormPanel form={form} setField={setField} onRegenerateId={() => setField('caseId', generateCaseId())} evidence={evidence} addFiles={addFiles} updateCaption={(id, caption) => setEvidence((current) => current.map((item) => item.id === id ? { ...item, caption } : item))} removeEvidence={(id) => setEvidence((current) => current.filter((item) => item.id !== id))} onDownload={handleDownload} onSave={handleSave} onNewFile={startNewFile} busy={busy} saving={saving} clearAfterSave={clearAfterSave} setClearAfterSave={setClearAfterSave} isEditing={Boolean(editingId)} canChangeStatus={canChangeCaseFileStatus} roster={schema?.roster || []} users={users} /><section className="min-w-0"><div className="mb-3 flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">CANLI ÖNİZLEME</span><span className="text-[11px] text-slate-500">~2460 px genişlik · PNG · 3×</span></div><div className="overflow-auto rounded-lg border border-slate-800 bg-[#060a12] p-4 lg:p-8" style={{ backgroundImage: 'radial-gradient(#141c2c 1px, transparent 1px)', backgroundSize: '18px 18px' }}><div className="mx-auto w-fit"><DocumentPreview ref={previewRef} form={form} evidence={evidence} /></div></div></section></main>}
  </div>
}
