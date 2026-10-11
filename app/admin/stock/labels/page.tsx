"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Printer, Search } from "lucide-react"
import { Barcode } from "@/components/admin/Barcode"
import type { StockItem } from "@/lib/inventory"

type Layout = "roll" | "a4"

export default function PrintLabelsPage() {
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [query, setQuery] = useState("")
  const [layout, setLayout] = useState<Layout>("roll")
  const [showPrice, setShowPrice] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stock", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(i => !q || [i.product, i.color, i.size, i.barcode].some(f => String(f).toLowerCase().includes(q)))
  }, [items, query])

  const labels = items.flatMap(i => Array.from({ length: counts[i._id] || 0 }, (_, n) => ({ ...i, key: `${i._id}-${n}` })))
  const missing = items.filter(i => counts[i._id] && !i.barcode).length

  function setCount(id: string, n: number) {
    setCounts(prev => ({ ...prev, [id]: Math.max(0, Math.min(500, n || 0)) }))
  }

  function oneEach() {
    setCounts(Object.fromEntries(visible.filter(i => i.barcode).map(i => [i._id, Math.max(1, i.stock)])))
  }

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading items...</div>

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/stock" className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground mb-1"><ArrowLeft className="h-3 w-3" /> Stock</Link>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Print Barcode Labels</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Pick how many stickers you need for each item, then print</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={layout} onChange={e => setLayout(e.target.value as Layout)} className="h-8 px-2 text-[10px] border border-border bg-background text-foreground">
            <option value="roll">Label printer — 50 × 25 mm roll</option>
            <option value="a4">A4 sticker sheet — 3 × 8</option>
          </select>
          <label className="flex items-center gap-1.5 text-[10px] text-foreground">
            <input type="checkbox" checked={showPrice} onChange={e => setShowPrice(e.target.checked)} className="accent-[#c4956a]" /> Show price
          </label>
          <button onClick={() => window.print()} disabled={!labels.length} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium disabled:opacity-30">
            <Printer className="h-3 w-3" /> Print {labels.length} label{labels.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>

      {missing > 0 && (
        <p className="text-xs px-3 py-2 border border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400">
          {missing} selected item{missing === 1 ? " has" : "s have"} no barcode — use &quot;Generate barcodes&quot; on the Stock page first.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 min-w-[220px] items-center gap-2 px-3 border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search product, colour, size" className="flex-1 h-9 text-xs bg-background text-foreground focus:outline-none" />
        </div>
        <button onClick={oneEach} className="px-3 py-2 border border-border text-[10px] font-medium text-foreground hover:border-[#c4956a]/30">One per unit in stock</button>
        <button onClick={() => setCounts({})} className="px-3 py-2 border border-border text-[10px] font-medium text-foreground hover:border-[#c4956a]/30">Clear</button>
      </div>

      <div className="border border-border">
        {visible.map(i => (
          <div key={i._id} className="flex items-center justify-between gap-3 px-3 py-2 border-b border-border last:border-b-0">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">{i.product}</p>
              <p className="text-[10px] text-muted-foreground">{i.color} · {i.size} · <span className="font-mono">{i.barcode || "no barcode"}</span> · {i.stock} in stock</p>
            </div>
            <input
              type="number"
              min={0}
              value={counts[i._id] || ""}
              placeholder="0"
              onChange={e => setCount(i._id, Number(e.target.value))}
              disabled={!i.barcode}
              className="w-16 h-7 px-2 text-[10px] border border-border bg-background text-foreground text-center focus:outline-none focus:border-[#c4956a]/50 disabled:opacity-30"
            />
          </div>
        ))}
      </div>

      {/* Print preview — this block is the only thing that prints */}
      {labels.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Preview</p>
          <div className="print-area">
            <style>{layout === "roll"
              ? "@media print { @page { size: 50mm 25mm; margin: 0 } .label { break-after: page } }"
              : "@media print { @page { size: A4; margin: 10mm 7mm } .labels { display: grid !important; grid-template-columns: repeat(3, 1fr); gap: 0 } }"}
            </style>
            <div className="labels flex flex-wrap gap-2">
              {labels.filter(l => l.barcode).map(l => (
                <div key={l.key} className="label bg-white text-black flex flex-col items-center justify-center overflow-hidden border border-dashed border-zinc-300 print:border-0" style={{ width: "50mm", height: layout === "roll" ? "25mm" : "34mm", padding: "1.5mm" }}>
                  <p className="text-[8px] font-semibold leading-tight text-center truncate w-full">VCHUKI · {l.product}</p>
                  <p className="text-[8px] leading-tight">{l.color} · Size {l.size}{showPrice ? ` · ₹${l.price.toLocaleString("en-IN")}` : ""}</p>
                  <Barcode value={l.barcode} height={layout === "roll" ? 30 : 40} width={1.3} fontSize={10} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
