import { useMemo, useState } from 'react'
import { Archive, Eye, Loader2, RefreshCw, Search, Trash2 } from 'lucide-react'
import { STATUS_OPTIONS } from '../constants'

const statusClass = {
  AÇIK: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  KAPALI: 'border-red-400/30 bg-red-400/10 text-red-300',
  'SORUŞTURMA SÜRÜYOR': 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  'ONAY BEKLİYOR': 'border-sky-400/30 bg-sky-400/10 text-sky-300',
}

export default function ArchivePanel({ files, loading, error, onRefresh, onOpen, onDelete, onStatusChange, deletingId, updatingId, isAdmin, canEdit, canChangeStatus }) {
  const [search, setSearch] = useState('')
  const filteredFiles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR')
    return query ? files.filter((file) => (file.suspectName || '').toLocaleLowerCase('tr-TR').includes(query)) : files
  }, [files, search])
  const noResults = files.length > 0 && filteredFiles.length === 0

  return (
    <main className="mx-auto max-w-[1400px] p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#1680ff]">MockAPI Arşivi</p><h2 className="mt-1 text-2xl font-bold text-white">Kayıtlı Dosyalar</h2><p className="mt-1 text-sm text-slate-400">{filteredFiles.length} dosya listeleniyor.</p></div>
        <button onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Yenile</button>
      </div>
      <div className="mb-5 max-w-xl"><label htmlFor="suspect-search" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Şüpheli adına göre ara</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input id="suspect-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Şüpheli adı yazın…" className="w-full rounded-lg border border-slate-700 bg-[#0d1626] py-2.5 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" /></div></div>
      {loading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#1680ff]" /></div> : error ? <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</div> : files.length === 0 || noResults ? <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-slate-700 bg-[#0d1626] p-6 text-center"><Archive className="h-9 w-9 text-slate-500" /><p className="mt-3 text-slate-300">{noResults ? 'Aradığınız kişiye ait herhangi bir dosya kaydı yok.' : 'Henüz kayıtlı dosya bulunmuyor.'}</p></div> : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1626]"><div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="border-b border-slate-800 bg-slate-950/40 text-[11px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Dosya No</th><th className="px-5 py-4">Belge Türü</th><th className="px-5 py-4">Şüpheli</th><th className="px-5 py-4">Memur</th><th className="px-5 py-4">Tarih</th><th className="px-5 py-4">Durum</th><th className="px-5 py-4 text-right">İşlemler</th></tr></thead><tbody className="divide-y divide-slate-800">
          {filteredFiles.map((file) => <tr key={file.id} className="transition hover:bg-slate-800/30"><td className="px-5 py-4 font-mono text-xs text-[#1680ff]">{file.caseId || '—'}</td><td className="px-5 py-4 text-slate-200">{file.documentType || '—'}</td><td className="px-5 py-4 text-slate-300">{file.suspectName || '—'}</td><td className="px-5 py-4 text-slate-300">{file.officerName || '—'}</td><td className="px-5 py-4 text-slate-400">{file.date || '—'}</td><td className="px-5 py-4">{canChangeStatus ? <select aria-label={`${file.caseId || 'Dosya'} durum etiketi`} value={file.status || STATUS_OPTIONS[0].value} onChange={(event) => onStatusChange(file, event.target.value)} disabled={updatingId === file.id} className={`cursor-pointer appearance-none rounded-full border bg-transparent px-2.5 py-1 text-[10px] font-bold outline-none transition hover:brightness-125 focus:ring-2 focus:ring-sky-500/30 disabled:cursor-wait disabled:opacity-50 ${statusClass[file.status] || 'border-slate-600 bg-slate-800 text-slate-300'}`}>{STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value} className="bg-slate-950 text-slate-100">{option.label}</option>)}</select> : <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClass[file.status] || 'border-slate-600 bg-slate-800 text-slate-300'}`}>{file.status || '—'}</span>}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => onOpen(file)} className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20"><Eye className="h-3.5 w-3.5" /> Aç / İncele</button>{isAdmin && <button onClick={() => onDelete(file)} disabled={deletingId === file.id} className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50">{deletingId === file.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Sil</button>}</div></td></tr>)}
        </tbody></table></div></div>
      )}
    </main>
  )
}

