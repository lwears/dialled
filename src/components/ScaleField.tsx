export function ScaleField({
  error,
  id,
  label,
  onChange,
  unit,
  value,
}: {
  error?: string
  id: string
  label: string
  onChange: (value: string) => void
  unit: string
  value: string
}) {
  return (
    <div className={`scale-field${error ? ' scale-field--error' : ''}`}>
      <label className="scale-field__label" htmlFor={id}>
        {error ?? label}
      </label>
      <div className="scale-field__row">
        <input
          aria-invalid={error ? true : undefined}
          aria-label={error ? `${label}: ${error}` : undefined}
          autoComplete="off"
          className="scale-field__input"
          enterKeyHint="done"
          id={id}
          inputMode="decimal"
          onChange={(event) => onChange(event.target.value)}
          placeholder="0.0"
          type="text"
          value={value}
        />
        <span className="scale-field__unit">{unit}</span>
      </div>
    </div>
  )
}
