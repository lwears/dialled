export function BackupBanner({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="banner" onClick={onOpen} type="button">
      <span>It’s been a while since your last backup.</span>
      <span className="banner__action">Back up →</span>
    </button>
  )
}
