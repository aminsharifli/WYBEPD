import RiceBadge from './RiceBadge'

export default function SplashScreen({ leaving }) {
  return (
    <div className={`splash-screen ${leaving ? 'splash-screen--leaving' : ''}`} aria-label="Yükleniyor">
      <div className="splash-content">
        <RiceBadge className="h-32 w-32 sm:h-40 sm:w-40" />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.45em] text-[#1680ff]">WYBE-LSPD</p>
        <p className="mt-2 text-sm uppercase tracking-[0.28em] text-slate-300">Los Santos Polis Departmanı</p>
      </div>
    </div>
  )
}

