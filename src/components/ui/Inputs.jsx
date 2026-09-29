import React from 'react'

/**
 * Small set of reusable, dark-themed form controls so the left panel stays consistent.
 */

const baseInput =
  'w-full rounded-md border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 ' +
  'placeholder:text-slate-600 outline-none transition ' +
  'focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/20'

export function Label({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400"
    >
      {children}
    </label>
  )
}

export function TextField({ label, id, ...props }) {
  return (
    <div>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <input id={id} className={baseInput} {...props} />
    </div>
  )
}

export function TextArea({ label, id, rows = 4, ...props }) {
  return (
    <div>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <textarea id={id} rows={rows} className={`${baseInput} resize-y leading-relaxed`} {...props} />
    </div>
  )
}

export function SelectField({ label, id, options = [], ...props }) {
  return (
    <div>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <select id={id} className={`${baseInput} appearance-none pr-8`} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
