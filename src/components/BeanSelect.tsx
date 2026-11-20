import { ROAST_LABELS } from '../domain/schemas'
import type { Bean } from '../domain/schemas'

export const NEW_BEAN_OPTION = '__new__'

export function BeanSelect({
  beans,
  error,
  onAddBean,
  onChange,
  value,
}: {
  beans: ReadonlyArray<Bean>
  error?: string
  onAddBean: () => void
  onChange: (beanId: string) => void
  value: string
}) {
  const selected = beans.find((bean) => bean.id === value)
  const subtitle = selected
    ? [selected.roaster, ROAST_LABELS[selected.roastLevel].toLowerCase()].filter(Boolean).join(' · ')
    : ''

  return (
    <div className={`bean-select${error ? ' bean-select--error' : ''}`}>
      <span aria-hidden="true" className="bean-select__text">
        <span className="bean-select__name">{selected?.name ?? 'Choose a bean'}</span>
        {subtitle ? <span className="bean-select__meta">{subtitle}</span> : null}
        {error ? <span className="bean-select__error">{error}</span> : null}
      </span>
      <svg aria-hidden="true" className="bean-select__chevron" fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="22">
        <path d="M8 10l4 4 4-4" />
      </svg>
      <select
        aria-label="Bean"
        className="bean-select__native"
        onChange={(event) => {
          if (event.target.value === NEW_BEAN_OPTION) {
            onAddBean()
          } else {
            onChange(event.target.value)
          }
        }}
        value={value}
      >
        {selected ? null : <option value="">Choose a bean…</option>}
        {beans.map((bean) => (
          <option key={bean.id} value={bean.id}>
            {bean.name}
            {bean.roaster ? ` · ${bean.roaster}` : ''}
          </option>
        ))}
        <option value={NEW_BEAN_OPTION}>+ Add a new bean…</option>
      </select>
    </div>
  )
}
