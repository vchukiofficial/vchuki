"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface Props {
  page: number
  totalPages: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
}

export function AdminPagination({ page, totalPages, total, perPage, onPageChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-3">
      <p className="text-[10px] text-muted-foreground">
        {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30">
          <ChevronLeft className="h-3 w-3" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
          return (
            <button key={p} onClick={() => onPageChange(p)} className={`h-7 w-7 text-[10px] font-medium ${page === p ? "bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14]" : "border border-border text-muted-foreground hover:text-foreground"}`}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30">
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
