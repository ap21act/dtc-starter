// Temporary wordmark — replace with designer asset once confirmed
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 shrink-0 ${className}`}>
      {/* Icon mark */}
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Toolbox body */}
        <rect x="2" y="14" width="30" height="18" rx="2" fill="#101820" />
        {/* Handle */}
        <path d="M11 14V10C11 8.34 12.34 7 14 7h6c1.66 0 3 1.34 3 3v4" stroke="#101820" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Latch accent */}
        <rect x="14" y="21" width="6" height="4" rx="1" fill="#F28C28" />
      </svg>
      {/* Wordmark */}
      <span className="font-headline text-xl font-bold text-navy uppercase tracking-tighter leading-none">
        My Toolbox
      </span>
    </div>
  )
}
