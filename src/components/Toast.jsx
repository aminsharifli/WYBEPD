import { CheckCircle2, X } from 'lucide-react'

export default function Toast({ message, onClose }) {
  if (!message) return null
  return (
    <div className="toast-enter fixed right-4 top-4 z-[110] flex max-w-sm items-center gap-3 rounded-xl border border-emerald-400/30 bg-[#10251f] px-4 py-3 text-sm font-semibold text-emerald-100 shadow-2xl shadow-black/40" role="status">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-emerald-200/70 transition hover:text-white" aria-label="Bildirimi kapat"><X className="h-4 w-4" /></button>
    </div>
  )
}
