import React, { forwardRef } from 'react'
import RiceBadge from './RiceBadge'
import { ORG, STATUS_STYLES } from '../constants'

const GOLD = '#c9a24b'

function InfoCell({ label, value }) {
  return (
    <div className="border border-slate-700/70 bg-slate-900/40 px-3 py-2">
      <div
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: GOLD }}
      >
        {label}
      </div>
      <div className="mt-0.5 break-words text-sm font-medium text-slate-100">{value || '—'}</div>
    </div>
  )
}

function Divider({ children }) {
  return (
    <div className="mb-3 mt-7 flex items-center gap-3">
      <span className="h-px flex-1" style={{ backgroundColor: `${GOLD}55` }} />
      <h3
        className="text-[11px] font-bold uppercase tracking-[0.28em]"
        style={{ color: GOLD }}
      >
        {children}
      </h3>
      <span className="h-px flex-1" style={{ backgroundColor: `${GOLD}55` }} />
    </div>
  )
}

function SignatureLine({ label, name }) {
  return (
    <div>
      <div className="flex h-8 items-end">
        <span className="font-display text-lg italic text-slate-300">{name || ' '}</span>
      </div>
      <div className="border-t border-slate-500 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
    </div>
  )
}

function ApprovalSignature({ approved }) {
  return (
    <div>
      <div className="flex h-8 items-end">
        {approved && (
          <span
            className="rotate-[-7deg] border-2 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em]"
            style={{ color: '#34d399', borderColor: '#34d399' }}
          >
            Onaylandı
          </span>
        )}
      </div>
      <div className="border-t border-slate-500 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Amir Onayı
      </div>
    </div>
  )
}

const DocumentPreview = forwardRef(function DocumentPreview({ form, evidence }, ref) {
  const charges = form.charges
    .split('\n')
    .map((c) => c.trim())
    .filter(Boolean)

  const status = STATUS_STYLES[form.status] || STATUS_STYLES.AÇIK

  return (
    <div
      ref={ref}
      style={{ width: 820, backgroundColor: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}
      className="relative overflow-hidden text-slate-100"
    >
      {}
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: '#1e3a8a' }} />
      <div className="absolute inset-x-0 h-[3px]" style={{ top: 6, backgroundColor: GOLD }} />

      {}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <RiceBadge style={{ width: 540, height: 371, opacity: 0.05 }} />
      </div>

      <div className="relative z-10 p-10">
        {}
        <div
          className="flex items-start justify-between gap-6 border-b-2 pb-5"
          style={{ borderColor: GOLD }}
        >
          <div className="flex items-center gap-4">
            <RiceBadge style={{ width: 96, height: 66 }} className="shrink-0" />
            <div>
              <p className="font-display text-lg font-bold uppercase leading-tight tracking-[0.18em] text-white">
                {ORG.headerTitle}
              </p>
              <p className="text-[13px] font-semibold text-slate-300">{ORG.fullName}</p>
              <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                Resmî Dosya Belgesi · Gizli
              </p>
              <p className="mt-1 font-display text-3xl font-bold uppercase tracking-wide text-white">
                {form.docType}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right text-[11px] leading-relaxed text-slate-300">
            <div className="mb-1">
              <div className="font-bold uppercase tracking-[0.15em]" style={{ color: GOLD }}>
                Dosya No
              </div>
              <div className="font-mono text-sm text-white">{form.caseId || '—'}</div>
            </div>
            <div>
              <span className="font-bold uppercase tracking-[0.15em]" style={{ color: GOLD }}>
                Tarih{' '}
              </span>
              <span className="text-white">{form.date || '—'}</span>
            </div>
            <div>
              <span className="font-bold uppercase tracking-[0.15em]" style={{ color: GOLD }}>
                Saat{' '}
              </span>
              <span className="text-white">{form.time || '—'}</span>
            </div>
          </div>
        </div>

        {}
        <Divider>Memur ve Şüpheli Bilgileri</Divider>
        <div className="grid grid-cols-3 gap-2">
          <InfoCell label="Raporlayan Memur" value={form.officerName} />
          <InfoCell label="Rozet #" value={form.badgeNumber} />
          <InfoCell label="Dosya Türü" value={form.docType} />
          <div className="col-span-2">
            <InfoCell label="Şüpheli(ler)" value={form.suspects} />
          </div>
          <InfoCell label="Durum" value={form.status} />
        </div>

        {}
        {form.sectionTitle ? (
          <div
            className="mt-6 border-l-4 px-4 py-2"
            style={{ borderColor: GOLD, backgroundColor: 'rgba(201, 162, 75, 0.08)' }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: GOLD }}
            >
              Bölüm
            </div>
            <div className="text-lg font-bold text-white">{form.sectionTitle}</div>
          </div>
        ) : null}

        {}
        <Divider>Detaylı Olay Özeti</Divider>
        <div className="doc-narrative min-h-[120px] border border-slate-700/70 bg-slate-900/40 p-4 text-[13px] leading-7 text-slate-200">
          {form.narrative || 'Olay özeti girilmedi.'}
        </div>

        {}
        <Divider>Suçlamalar ve İhlaller</Divider>
        {charges.length ? (
          <ol className="space-y-1.5">
            {charges.map((c, i) => (
              <li
                key={i}
                className="flex gap-3 border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-[13px] text-slate-100"
              >
                <span className="font-mono font-bold" style={{ color: GOLD }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[13px] italic text-slate-500">Suçlama belirtilmedi.</p>
        )}

        {}
        <Divider>Kanıt Galerisi</Divider>
        {evidence.length ? (
          <div className="grid grid-cols-2 gap-4">
            {evidence.map((ev, i) => (
              <figure
                key={ev.id}
                className="border p-2"
                style={{ borderColor: `${GOLD}40`, backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
              >
                <div
                  className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{ color: GOLD }}
                >
                  Kanıt {String(i + 1).padStart(2, '0')}
                </div>
                <img
                  src={ev.src}
                  alt={ev.caption || `Kanıt ${i + 1}`}
                  className="h-48 w-full object-cover"
                />
                <figcaption className="mt-2 text-[11px] leading-snug text-slate-300">
                  {ev.caption || 'Açıklama yok.'}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="text-[13px] italic text-slate-500">Bu dosyaya kanıt eklenmedi.</p>
        )}

        {}
        <div className="mt-10 border-t-2 pt-6" style={{ borderColor: GOLD }}>
          <div className="grid grid-cols-2 gap-10">
            <SignatureLine label="Raporlayan Memur İmzası" name={form.officerName} />
            <ApprovalSignature approved={form.status !== 'ONAY BEKLİYOR'} />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{
                color: status.text,
                border: `1px solid ${status.border}`,
                backgroundColor: status.bg,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                padding: '6px 12px',
              }}
            >
              {form.status}
            </div>
            <div className="font-mono text-[10px] text-slate-500">
              Oluşturulma {new Date().toLocaleString('tr-TR')} · {form.caseId}
            </div>
          </div>

          <p className="mt-5 text-[10px] leading-relaxed text-slate-500">
            <span className="font-bold" style={{ color: GOLD }}>
              GİZLİLİK UYARISI —{' '}
            </span>
            Bu belge {ORG.fullName} ve {ORG.server} sunucusuna aittir; yalnızca yetkili personelin kullanımı
            içindir ve ayrıcalıklı, gizli bilgiler içerir. İzinsiz inceleme, ifşa, çoğaltma veya dağıtım kesinlikle
            yasaktır ve disiplin ve/veya cezai işlemle sonuçlanabilir. Bu, FiveM roleplay için hazırlanmış kurgusal
            bir belgedir ve hiçbir hukuki geçerliliği yoktur.
          </p>
        </div>
      </div>
    </div>
  )
})

export default DocumentPreview
