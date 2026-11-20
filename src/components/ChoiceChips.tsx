export function ChoiceChips<T extends string | number>({
  allowDeselect = false,
  className = '',
  error,
  label,
  onChange,
  options,
  value,
}: {
  allowDeselect?: boolean
  className?: string
  error?: string
  label: string
  onChange: (value: T | undefined) => void
  options: ReadonlyArray<{ label: string; value: T }>
  value: T | undefined
}) {
  return (
    <fieldset className={`field chips ${className}${error ? ' field--error' : ''}`}>
      <legend className="field__label">{label}</legend>
      <div className="chips__row">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              aria-pressed={selected}
              className="chip"
              key={option.value}
              onClick={() => onChange(selected && allowDeselect ? undefined : option.value)}
              type="button"
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {error ? <p className="field__error">{error}</p> : null}
    </fieldset>
  )
}
