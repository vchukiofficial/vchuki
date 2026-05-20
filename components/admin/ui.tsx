"use client"

import { useState, useCallback } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"

// Status Badge - reusable across orders, payments, etc.
export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
    shipped: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
    delivered: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    cancelled: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
    paid: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    failed: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
    active: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    inactive: { bg: "bg-zinc-500/10", text: "text-zinc-500" },
  }
  const c = config[status] || config.pending
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${c.bg} ${c.text}`}>
      {status}
    </span>
  )
}

// Stat Card - reusable KPI widget
export function StatCard({ icon: Icon, label, value, change, trend }: {
  icon: any; label: string; value: string | number; change?: string; trend?: "up" | "down"
}) {
  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground/50" strokeWidth={1.5} />
      </div>
      <p className="text-2xl font-semibold mt-2 tracking-tight">{value}</p>
      {change && (
        <p className={`text-[10px] mt-1 font-medium ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
          {change}
        </p>
      )}
    </div>
  )
}

// Multi-File Upload Component
export function FileUpload({ images, onChange, maxFiles = 10 }: {
  images: string[]; onChange: (images: string[]) => void; maxFiles?: number
}) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setUploading(true)

    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        if (res.ok) {
          const data = await res.json()
          uploaded.push(data.url)
        }
      } catch {}
    }

    onChange([...images, ...uploaded])
    setUploading(false)
    e.target.value = ""
  }, [images, onChange])

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative h-20 w-20 rounded-md overflow-hidden border group">
            <Image src={url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}
        {images.length < maxFiles && (
          <label className="h-20 w-20 rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-foreground/30 transition-colors">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground mt-1">Upload</span>
              </>
            )}
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5">{images.length}/{maxFiles} images · Click to upload or drag & drop</p>
    </div>
  )
}

// Empty State
export function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-10 w-10 text-muted-foreground/20" strokeWidth={1} />
      <p className="text-sm font-medium mt-3">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

// Section Header
export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}
