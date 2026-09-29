import { useState } from 'react'
import { Fingerprint, LockKeyhole, LogIn, Radio, ShieldCheck, UserRound } from 'lucide-react'
import RiceBadge from './RiceBadge'

const inputClass = 'w-full rounded-xl border border-slate-700/80 bg-[#080e19]/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#1680ff]/70 focus:ring-2 focus:ring-[#1680ff]/15'

export default function LoginScreen({ onLogin, busy, error }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')

  async function submit(event) {
    event.preventDefault()
    const data = { firstName: firstName.trim(), lastName: lastName.trim(), password }
    await onLogin(data)
  }

  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#070c14] px-4 py-10 sm:px-6">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_20%,rgba(30,58,138,0.25),transparent_38%),radial-gradient(ellipse_at_85%_82%,rgba(201,162,75,0.11),transparent_35%)]" />
    <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(148,163,184,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.35)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
    <section className="relative grid w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-700/80 bg-[#0c1422]/95 shadow-[0_32px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl md:grid-cols-[0.92fr_1.08fr]">
      <div className="relative flex min-h-[250px] flex-col items-center justify-center overflow-hidden border-b border-slate-700/70 bg-gradient-to-br from-[#14294a] via-[#101b2d] to-[#0c1422] px-7 py-9 text-center md:min-h-[580px] md:border-b-0 md:border-r md:px-10">
        <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-[#1680ff]/10 blur-3xl" />
        <div className="relative"><div className="mx-auto grid h-28 w-28 place-items-center rounded-[30px] border border-white/10 bg-slate-950/30 p-3 shadow-2xl shadow-black/30 ring-1 ring-white/[0.04]"><RiceBadge className="h-full w-full" /></div><p className="mt-7 text-[10px] font-bold uppercase tracking-[0.34em] text-[#1680ff]">Los Santos Police Department</p><h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">WYBE <span className="text-sky-300">LSPD</span></h1><p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-400">Personel işlemleri ve departman kaynakları için güvenli portal.</p></div>
        <div className="relative mt-8 hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/30 px-4 py-2 text-[11px] font-semibold tracking-wide text-slate-400 md:flex"><Radio className="h-3.5 w-3.5 text-emerald-300" /> DEPARTMAN AĞI <span className="mx-1 h-1 w-1 rounded-full bg-slate-600" /> AKTİF</div>
      </div>
      <div className="flex items-center px-6 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8"><div className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-[#1680ff]/20 bg-[#1680ff]/10 text-[#1680ff]"><ShieldCheck className="h-5 w-5" /></div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Personel doğrulama</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Tekrar hoş geldiniz</h2><p className="mt-2 text-sm text-slate-400">Hesabınıza giriş yapmak için bilgilerinizi girin.</p></div>
          <form className="space-y-5" onSubmit={submit}>
            <div className="grid grid-cols-2 gap-3"><label className="block text-xs font-semibold text-slate-300">Ad<div className="relative mt-2"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Adınız" className={inputClass} /></div></label><label className="block text-xs font-semibold text-slate-300">Soyad<div className="relative mt-2"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Soyadınız" className={inputClass} /></div></label></div>
            <label className="block text-xs font-semibold text-slate-300">Şifre<div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifrenizi girin" className={inputClass} /></div></label>
            {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-sm leading-5 text-red-300"><span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />{error}</p>}
            <button disabled={busy} className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#1680ff]/40 bg-gradient-to-r from-[#1680ff] to-[#e0bd6d] px-4 py-3.5 text-sm font-extrabold text-[#111827] shadow-lg shadow-[#1680ff]/10 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#1680ff]/20 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60"><LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />{busy ? 'Giriş yapılıyor…' : 'Giriş yap'}</button>
          </form>
          <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-800/80 pt-5 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-600"><Fingerprint className="h-3.5 w-3.5" /> Yetkili personel erişimi</div>
        </div>
      </div>
    </section>
  </main>
}

