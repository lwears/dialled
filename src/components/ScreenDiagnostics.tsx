export function ScreenDiagnostics({
  onMeasure,
  rows,
}: {
  onMeasure: () => void
  rows: ReadonlyArray<[string, string]> | null
}) {
  return (
    <section className="card stack">
      <h2>Screen diagnostics</h2>
      <button className="btn btn--block" onClick={onMeasure} type="button">
        Measure screen
      </button>
      {rows ? (
        <dl className="diagnostics">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}
