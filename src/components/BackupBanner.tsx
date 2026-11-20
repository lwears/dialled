export function BackupBanner({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="banner" role="status">
      <svg aria-hidden="true" className="banner__icon" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="20">
        <path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z" />
        <path d="M12 11v5M10 13l2-2 2 2" />
      </svg>
      <span className="banner__text">It’s been a while since your last backup</span>
      <button className="banner__action" onClick={onOpen} type="button">
        Back up
      </button>
    </div>
  )
}
