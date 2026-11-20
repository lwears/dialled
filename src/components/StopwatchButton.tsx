export function StopwatchButton({
  elapsedMs,
  onReset,
  onToggle,
  running,
}: {
  elapsedMs: number
  onReset: () => void
  onToggle: () => void
  running: boolean
}) {
  const seconds = (elapsedMs / 1000).toFixed(1)
  return (
    <div className="stopwatch">
      <button
        aria-label={running ? `Stop timer at ${seconds} seconds` : 'Start shot timer'}
        aria-pressed={running}
        className={`stopwatch__main${running ? ' stopwatch__main--running' : ''}`}
        onClick={onToggle}
        type="button"
      >
        <span className="stopwatch__time">{seconds}s</span>
        <span className="stopwatch__hint">{running ? 'Tap to stop' : 'Tap to start timer'}</span>
      </button>
      {!running && elapsedMs > 0 ? (
        <button className="btn btn--ghost stopwatch__reset" onClick={onReset} type="button">
          Reset
        </button>
      ) : null}
    </div>
  )
}
