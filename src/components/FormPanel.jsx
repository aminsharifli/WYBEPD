import React, { useRef, useState } from 'react'
import {
  AlignLeft,
  Camera,
  Download,
  Save,
  FileText,
  FilePlus2,
  Hash,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react'
import { TextField, TextArea, SelectField, Label } from './ui/Inputs'
import { DOC_TYPES, STATUS_OPTIONS } from '../constants'

function Card({ icon: Icon, title, children }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-[#0d1626] p-4">
      <header className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#1680ff]" />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200">{title}</h2>
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export default function FormPanel({
  form,
  setField,
  onRegenerateId,
  evidence,
  addFiles,
  updateCaption,
  removeEvidence,
  onDownload,
  onSave,
  onNewFile,
  busy,
  saving,
  clearAfterSave,
  setClearAfterSave,
  isEditing,
}) {
  const fileRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onNewFile} disabled={busy || saving} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-slate-200 transition hover:border-[#1680ff]/60 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
        <FilePlus2 className="h-4 w-4 text-[#1680ff]" /> Yeni Dosya
      </button>
      <div className="grid gap-2 sm:grid-cols-2">
        <button onClick={onDownload} disabled={busy || saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1680ff] px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-[#0a0f1a] shadow-lg shadow-[#1680ff]/10 transition hover:bg-[#dbb463] disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {busy ? 'Hazırlanıyor…' : 'PNG İNDİR & KAYDET'}
        </button>
        <button onClick={onSave} disabled={busy || saving} className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-500/50 bg-sky-500/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Kaydediliyor…' : isEditing ? 'Değişiklikleri Kaydet' : 'Sisteme Kaydet'}
        </button>
      </div>
      <label className="-mt-1 flex cursor-pointer items-center gap-2 text-xs text-slate-400">
        <input type="checkbox" checked={clearAfterSave} onChange={(event) => setClearAfterSave(event.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-[#1680ff] focus:ring-[#1680ff]/30" />
        Kaydedince formu temizle ve yeni dosya aç
      </label>

      <Card icon={FileText} title="Belge Türü & Durum">
        <SelectField
          label="Belge Türü"
          id="docType"
          value={form.docType}
          onChange={(e) => setField('docType', e.target.value)}
          options={DOC_TYPES}
        />
        <SelectField
          label="Durum Etiketi"
          id="status"
          value={form.status}
          onChange={(e) => setField('status', e.target.value)}
          options={STATUS_OPTIONS}
        />
      </Card>

      <Card icon={Hash} title="Temel Bilgiler">
        <div>
          <Label htmlFor="caseId">Dosya No</Label>
          <div className="flex gap-2">
            <input
              id="caseId"
              value={form.caseId}
              onChange={(e) => setField('caseId', e.target.value)}
              className="w-full flex-1 rounded-md border border-slate-700/80 bg-slate-950/60 px-3 py-2 font-mono text-sm text-slate-100 outline-none transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/20"
            />
            <button
              type="button"
              onClick={onRegenerateId}
              title="Yeni numara üret"
              className="grid w-10 shrink-0 place-items-center rounded-md border border-slate-700 bg-slate-900 text-slate-300 transition hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Tarih"
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => setField('date', e.target.value)}
          />
          <TextField
            label="Saat"
            id="time"
            type="time"
            value={form.time}
            onChange={(e) => setField('time', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-slate-700/80 bg-slate-950/60 px-3 py-2"><span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Memur</span><span className="mt-1 block text-sm text-slate-100">{form.officerName || '—'}</span></div>
          <div className="rounded-md border border-slate-700/80 bg-slate-950/60 px-3 py-2"><span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Rozet No</span><span className="mt-1 block font-mono text-sm text-slate-100">{form.badgeNumber || '—'}</span></div>
        </div>

        <TextField
          label="Şüpheli Adı"
          id="suspects"
          placeholder="Ad Soyad, Ad Soyad"
          value={form.suspects}
          onChange={(e) => setField('suspects', e.target.value)}
        />
      </Card>

      <Card icon={AlignLeft} title="İçerik ve Detaylar">
        <TextField
          label="Bölüm Başlığı"
          id="sectionTitle"
          placeholder="örn. Silahlı Soygun — Vinewood Bulvarı"
          value={form.sectionTitle}
          onChange={(e) => setField('sectionTitle', e.target.value)}
        />
        <TextArea
          label="Detaylı Olay Özeti / Açıklama"
          id="narrative"
          rows={9}
          placeholder="Olayın gelişim sırası, taraflar, alınan önlemler…"
          value={form.narrative}
          onChange={(e) => setField('narrative', e.target.value)}
        />
        <TextArea
          label="Suçlamalar / İhlaller — her satıra bir suçlama"
          id="charges"
          rows={5}
          placeholder={'Uyuşturucu Ticareti\nYağma (Gasp)\nTehlikeli Sürüş\nRuhsatsız Silah Bulundurma'}
          value={form.charges}
          onChange={(e) => setField('charges', e.target.value)}
        />
      </Card>

      <Card icon={Camera} title="Kanıtlar ve Görseller">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            addFiles(e.dataTransfer.files)
          }}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition ${
            dragOver ? 'border-[#1680ff] bg-[#1680ff]/10' : 'border-slate-700 hover:border-slate-500'
          }`}
        >
          <Upload className="h-6 w-6 text-slate-400" />
          <p className="text-sm text-slate-300">
            Görselleri buraya sürükleyin veya <span className="text-[#1680ff]">seçin</span>
          </p>
          <p className="text-[11px] text-slate-500">Sabıka fotoğrafı · olay yeri · kanıt görüntüleri — PNG / JPG</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>

        {evidence.length > 0 && (
          <ul className="space-y-3">
            {evidence.map((ev, i) => (
              <li
                key={ev.id}
                className="flex gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-2"
              >
                <img
                  src={ev.src}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded object-cover ring-1 ring-slate-700"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Kanıt {String(i + 1).padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => removeEvidence(ev.id)}
                      title="Sil"
                      className="text-slate-500 transition hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    value={ev.caption}
                    onChange={(e) => updateCaption(ev.id, e.target.value)}
                    placeholder="Açıklama / fotoğraf başlığı…"
                    className="w-full rounded border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs text-slate-200 outline-none focus:border-sky-500"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="flex items-start gap-2 rounded-lg border border-slate-800 bg-[#0d1626] p-3 text-[11px] leading-relaxed text-slate-500">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
        Bu araç yalnızca FiveM rol yapma amacıyla kullanılmalıdır. Oluşturulan belgeler kurgusaldır ve hiçbir hukuki
        geçerliliği yoktur.
      </p>
    </div>
  )
}

