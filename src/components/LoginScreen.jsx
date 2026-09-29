import { useState } from 'react'
import { LogIn } from 'lucide-react'
import RiceBadge from './RiceBadge'

export default function LoginScreen({ onLogin, busy, error }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')

  async function submit(event) {
    event.preventDefault()
    const data = { firstName: firstName.trim(), lastName: lastName.trim(), password }
    await onLogin(data)
  }

  return <main className="grid min-h-screen place-items-center px-4 py-10">
    <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0d1626] p-7 shadow-2xl shadow-black/30">
      <div className="mb-6 text-center">
        <RiceBadge className="mx-auto mb-4 h-20 max-w-40" />
        <h1 className="text-2xl font-bold text-white">Sisteme giriş</h1>
        <p className="mt-2 text-sm text-slate-400">WYBE-LSPD Personel Portalı</p>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-300">Ad<input required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500" /></label>
          <label className="text-xs font-semibold text-slate-300">Soyad<input required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500" /></label>
        </div>
        <label className="block text-xs font-semibold text-slate-300">Şifre<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500" /></label>
        {error && <p role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-60"><LogIn className="h-4 w-4" />{busy ? 'Bekleyin…' : 'Giriş yap'}</button>
      </form>
    </section>
  </main>
}
