import { ExternalLink, BookOpen } from 'lucide-react'

const HANDBOOK_PREVIEW_URL = 'https://docs.google.com/document/d/1BNjdQCU3MJscgjVyJdPRF4NgsGA6OI7tHR4zgt4vXVI/preview'
const HANDBOOK_SOURCE_URL = 'https://docs.google.com/document/d/1BNjdQCU3MJscgjVyJdPRF4NgsGA6OI7tHR4zgt4vXVI/edit?tab=t.0'

export default function HandbookPanel() {
  return <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8">
    <header className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-gradient-to-br from-[#162847] via-[#101b2e] to-[#0d1626] p-5 sm:p-7">
      <div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-xl border border-[#1680ff]/20 bg-[#1680ff]/10 text-[#1680ff]"><BookOpen className="h-6 w-6" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1680ff]">LSPD · PERSONEL REHBERİ</p><h2 className="mt-1 text-2xl font-bold text-white">El Kitapçığı</h2><p className="mt-1 text-sm text-slate-400">Los Santos Polis Departmanı El Kitapçığı</p></div></div>
      <a href={HANDBOOK_SOURCE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"><ExternalLink className="h-4 w-4" /> Ayrı sekmede aç</a>
    </header>
    <section className="overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl shadow-black/20"><iframe title="Los Santos Polis Departmanı El Kitapçığı" src={HANDBOOK_PREVIEW_URL} className="block h-[calc(100vh-190px)] min-h-[720px] w-full border-0 bg-white" loading="lazy" allow="fullscreen" /></section>
  </main>
}

