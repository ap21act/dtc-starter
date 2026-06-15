"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
  "data-testid": dataTestid,
}: {
  page: number
  totalPages: number
  "data-testid"?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const go = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", p.toString())
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const pages: (number | "…")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else if (page <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push("…")
    pages.push(totalPages)
  } else if (page >= totalPages - 3) {
    pages.push(1)
    pages.push("…")
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push("…")
    for (let i = page - 1; i <= page + 1; i++) pages.push(i)
    pages.push("…")
    pages.push(totalPages)
  }

  return (
    <div className="mt-12 flex justify-center" data-testid={dataTestid}>
      <nav className="flex gap-1 items-center">
        <button
          onClick={() => go(page - 1)}
          disabled={page === 1}
          className="w-10 h-10 border border-border flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`e${i}`}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => go(p as number)}
              disabled={p === page}
              className={`w-10 h-10 border flex items-center justify-center text-sm font-bold transition-colors ${
                p === page
                  ? "bg-navy text-white border-navy"
                  : "border-border hover:bg-surface-container-high text-on-surface"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          className="w-10 h-10 border border-border flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
        </button>
      </nav>
    </div>
  )
}
