import { Check, Palette, X } from 'lucide-react'

const themes = [
  { id: 'original', label: 'Varsayılan Mavi', color: '#1680ff' },
  { id: 'blue', label: 'Lacivert', color: '#6b9bd6' },
  { id: 'emerald', label: 'Orman', color: '#77a58a' },
  { id: 'violet', label: 'Mürdüm', color: '#9a8bbd' },
  { id: 'amber', label: 'Bronz', color: '#b79a67' },
  { id: 'rose', label: 'Bordo', color: '#b1848d' },
]

export default function HeaderSettingsPanel({ theme, onChange, onClose }) {
  return <section className="header-popover settings-popover" aria-label="Site ayarları">
    <header><div><Palette className="h-4 w-4 text-sky-300" /><strong>Site ayarları</strong></div><button type="button" onClick={onClose} aria-label="Ayarları kapat"><X className="h-4 w-4" /></button></header>
    <p className="settings-caption">Tema rengi bu tarayıcıda saklanır.</p>
    <div className="theme-options">{themes.map((item) => <button type="button" key={item.id} onClick={() => onChange(item.id)} aria-pressed={theme === item.id} className={theme === item.id ? 'is-selected' : ''}><i style={{ backgroundColor: item.color }} />{item.label}{theme === item.id && <Check className="h-4 w-4" />}</button>)}</div>
  </section>
}
