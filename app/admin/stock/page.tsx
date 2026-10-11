"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { RefreshCw, Download, ScanBarcode, Printer, History, Barcode as BarcodeIcon, Search, X } from "lucide-react"
import { exportToExcel } from "@/lib/admin/exportExcel"
import type { StockItem } from "@/lib/inventory"

interface Stats {
  totalVariants: number
  totalStock: number
  soldOut: number
  lowStock: number
  healthy: number
  missingBarcodes: number
}

interface Movement {
  _id: string
  product: string
  size: string
  color: string
  change: number
  balanceAfter: number
  reason: string
  note: string
  by: string
  createdAt: string
}

const REASON_LABEL: Record<string, string> = {
  restock: "Restock",
  correction: "Count correction",
  store_sale: "Shop sale",
  online_order: "Online order",
  order_restored: "Order cancelled / returned",
  damaged: "Damaged / removed",
}

type Filter = "all" | "soldout" | "low"

export default function AdminStockPage() {
  const [stats, setStats] = useState<Stats>({ totalVariants: 0, totalStock: 0, soldOut: 0, lowStock: 0, healthy: 0, missingBarcodes: 0 })
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const [scan, setScan] = useState("")
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [history, setHistory] = useState<{ title: string; rows: Movement[] } | null>(null)
  const scanRef = useRef<HTMLInputElement>(null)

  function fetchStock() {
    setLoading(true)
    fetch("/api/admin/stock", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setStats(d.stats || stats); setItems(d.items || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchStock() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function flash(text: string, ok = true) {
    setMessage({ text, ok })
    setTimeout(() => setMessage(null), 4000)
  }

  async function adjust(variantId: string, mode: "add" | "remove" | "set", quantity: number, note?: string) {
    const res = await fetch("/api/admin/stock", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ variantId, mode, quantity, note }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { flash(data.error || "Could not update stock", false); return false }
    setItems(prev => prev.map(i => i._id === variantId ? { ...i, stock: data.stock } : i))
    return true
  }

  // Receive mode: every scan adds one unit to that item
  async function onScan(e: React.FormEvent) {
    e.preventDefault()
    const code = scan.trim().toUpperCase()
    setScan("")
    if (!code) return
    const item = items.find(i => i.barcode === code || i.sku.toUpperCase() === code)
    if (!item) { flash(`No item with barcode ${code}`, false); return }
    if (await adjust(item._id, "add", 1, "Received (scanned)")) {
      setHighlight(item._id)
      flash(`+1 ${item.product} · ${item.color} · ${item.size} → ${item.stock + 1} in stock`)
    }
    scanRef.current?.focus()
  }

  async function generateBarcodes() {
    const res = await fetch("/api/admin/stock", { method: "POST", credentials: "include" })
    const data = await res.json().catch(() => ({}))
    if (res.ok) { flash(`Assigned ${data.assigned} new barcode${data.assigned === 1 ? "" : "s"}`); fetchStock() }
    else flash(data.error || "Could not generate barcodes", false)
  }

  async function openHistory(item?: StockItem) {
    const url = item ? `/api/admin/stock/movements?variantId=${item._id}` : "/api/admin/stock/movements"
    const data = await fetch(url, { credentials: "include" }).then(r => r.json()).catch(() => ({}))
    setHistory({ title: item ? `${item.product} · ${item.color} · ${item.size}` : "All stock movements", rows: data.movements || [] })
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(i => {
      if (filter === "soldout" && i.stock !== 0) return false
      if (filter === "low" && !(i.stock > 0 && i.stock <= 5)) return false
      if (!q) return true
      return [i.product, i.color, i.size, i.sku, i.barcode].some(f => String(f).toLowerCase().includes(q))
    })
  }, [items, filter, query])

  const totalUnits = items.reduce((s, i) => s + i.stock, 0)

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading stock data...</div>

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Stock Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Every size and colour, shared by the website and the shop</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/pos" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium">
            <ScanBarcode className="h-3 w-3" /> Shop Billing
          </Link>
          <Link href="/admin/stock/labels" className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
            <Printer className="h-3 w-3" /> Print Labels
          </Link>
          <button onClick={() => openHistory()} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
            <History className="h-3 w-3" /> History
          </button>
          <button onClick={() => exportToExcel({ title: "Stock Report", sheetName: "Stock", filename: "VCHUKI_Stock", columns: [{ header: "Product", key: "product", width: 30 }, { header: "Color", key: "color", width: 14 }, { header: "Size", key: "size", width: 8 }, { header: "Stock", key: "stock", width: 8 }, { header: "Price", key: "price", width: 10 }, { header: "Barcode", key: "barcode", width: 14 }, { header: "SKU", key: "sku", width: 30 }], data: items.map(i => ({ product: i.product, color: i.color, size: i.size, stock: i.stock, price: i.price, barcode: i.barcode, sku: i.sku })) })} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
            <Download className="h-3 w-3" /> Export
          </button>
          <button onClick={fetchStock} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total SKUs</p>
          <p className="text-xl font-light text-foreground mt-1">{stats.totalVariants}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Units</p>
          <p className="text-xl font-light text-foreground mt-1">{totalUnits.toLocaleString()}</p>
        </div>
        <button onClick={() => setFilter(filter === "soldout" ? "all" : "soldout")} className={`p-3 border text-left ${filter === "soldout" ? "border-red-500" : "border-red-500/20"} bg-red-500/5`}>
          <p className="text-[10px] uppercase tracking-wider text-red-500">Sold Out</p>
          <p className="text-xl font-light text-red-500 mt-1">{items.filter(i => i.stock === 0).length}</p>
        </button>
        <button onClick={() => setFilter(filter === "low" ? "all" : "low")} className={`p-3 border text-left ${filter === "low" ? "border-amber-500" : "border-amber-500/20"} bg-amber-500/5`}>
          <p className="text-[10px] uppercase tracking-wider text-amber-600">Low Stock (≤5)</p>
          <p className="text-xl font-light text-amber-600 mt-1">{items.filter(i => i.stock > 0 && i.stock <= 5).length}</p>
        </button>
        <div className="p-3 border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-[10px] uppercase tracking-wider text-emerald-600">Healthy</p>
          <p className="text-xl font-light text-emerald-600 mt-1">{items.filter(i => i.stock > 5).length}</p>
        </div>
      </div>

      {stats.missingBarcodes > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 border border-amber-500/30 bg-amber-500/5">
          <p className="text-xs text-amber-700 dark:text-amber-400">{stats.missingBarcodes} item{stats.missingBarcodes === 1 ? " has" : "s have"} no barcode yet — they can&apos;t be scanned at the shop.</p>
          <button onClick={generateBarcodes} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium">
            <BarcodeIcon className="h-3 w-3" /> Generate barcodes
          </button>
        </div>
      )}

      {/* Scan to receive + search */}
      <div className="grid md:grid-cols-2 gap-3">
        <form onSubmit={onScan} className="flex items-center gap-2 p-3 border border-[#c4956a]/40 bg-[#c4956a]/5">
          <ScanBarcode className="h-4 w-4 text-[#c4956a] flex-shrink-0" />
          <input
            ref={scanRef}
            value={scan}
            onChange={e => setScan(e.target.value)}
            placeholder="Receiving stock? Scan a label here — each scan adds 1"
            className="flex-1 h-8 px-2 text-xs border border-border bg-background text-foreground focus:outline-none focus:border-[#c4956a]/50"
          />
        </form>
        <div className="flex items-center gap-2 p-3 border border-border">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search product, colour, size or barcode"
            className="flex-1 h-8 px-2 text-xs border border-border bg-background text-foreground focus:outline-none focus:border-[#c4956a]/50"
          />
        </div>
      </div>

      {message && (
        <p className={`text-xs px-3 py-2 border ${message.ok ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400" : "border-red-500/30 bg-red-500/5 text-red-600"}`}>{message.text}</p>
      )}

      {/* Inventory */}
      <div className="border border-border">
        <div className="hidden md:grid grid-cols-[1fr_120px_90px_70px_300px] gap-3 px-3 py-2 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Item</span><span>Barcode</span><span>Price</span><span>Stock</span><span>Adjust</span>
        </div>
        {visible.length === 0 && <p className="text-xs text-muted-foreground text-center py-10">No items match.</p>}
        {visible.map(item => (
          <StockRow key={item._id} item={item} highlighted={highlight === item._id} onAdjust={adjust} onHistory={() => openHistory(item)} />
        ))}
      </div>

      {history && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" onClick={() => setHistory(null)}>
          <div className="bg-background border border-border w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background">
              <h3 className="text-sm font-medium text-foreground">{history.title}</h3>
              <button onClick={() => setHistory(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            {history.rows.length === 0 && <p className="text-xs text-muted-foreground p-6 text-center">No stock changes recorded yet.</p>}
            {history.rows.map(m => (
              <div key={m._id} className="grid grid-cols-[110px_1fr_60px_60px] gap-3 px-4 py-2 border-b border-border text-xs">
                <span className="text-muted-foreground">{new Date(m.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                <span className="text-foreground">
                  {REASON_LABEL[m.reason] || m.reason}
                  {!history.title.includes(m.product) && <span className="text-muted-foreground"> · {m.product} {m.color} {m.size}</span>}
                  {m.note && <span className="block text-[10px] text-muted-foreground">{m.note}{m.by ? ` — ${m.by}` : ""}</span>}
                </span>
                <span className={`text-right font-medium ${m.change > 0 ? "text-emerald-600" : "text-red-500"}`}>{m.change > 0 ? "+" : ""}{m.change}</span>
                <span className="text-right text-muted-foreground">= {m.balanceAfter}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StockRow({ item, highlighted, onAdjust, onHistory }: {
  item: StockItem
  highlighted: boolean
  onAdjust: (id: string, mode: "add" | "remove" | "set", qty: number) => Promise<boolean>
  onHistory: () => void
}) {
  const [qty, setQty] = useState("")
  const [busy, setBusy] = useState(false)

  async function run(mode: "add" | "remove" | "set") {
    if (qty === "") return
    setBusy(true)
    if (await onAdjust(item._id, mode, Number(qty))) setQty("")
    setBusy(false)
  }

  const btn = "h-7 px-2 text-[9px] font-medium uppercase border border-border text-foreground hover:border-[#c4956a]/50 disabled:opacity-30"

  return (
    <div className={`grid grid-cols-2 md:grid-cols-[1fr_120px_90px_70px_300px] gap-2 md:gap-3 items-center px-3 py-2 border-b border-border last:border-b-0 ${highlighted ? "bg-emerald-500/10" : ""}`}>
      <div className="col-span-2 md:col-span-1 min-w-0">
        <Link href={`/admin/products/${item.productId}`} className="text-xs font-medium text-foreground hover:text-[#c4956a] transition-colors">{item.product}</Link>
        <p className="text-[10px] text-muted-foreground">{item.color} · {item.size}</p>
      </div>
      <span className="text-[10px] font-mono text-muted-foreground">{item.barcode || "—"}</span>
      <span className="text-xs text-foreground">₹{item.price.toLocaleString("en-IN")}</span>
      <button onClick={onHistory} title="View history" className={`text-xs font-semibold text-left ${item.stock === 0 ? "text-red-500" : item.stock <= 5 ? "text-amber-600" : "text-foreground"}`}>
        {item.stock}
      </button>
      <div className="col-span-2 md:col-span-1 flex items-center gap-1.5">
        <input
          type="number"
          value={qty}
          onChange={e => setQty(e.target.value)}
          placeholder="Qty"
          min={0}
          className="w-14 h-7 px-2 text-[10px] border border-border bg-background text-foreground text-center focus:outline-none focus:border-[#c4956a]/50"
        />
        <button onClick={() => run("add")} disabled={busy || qty === ""} className={btn}>+ Add</button>
        <button onClick={() => run("remove")} disabled={busy || qty === ""} className={btn}>− Remove</button>
        <button onClick={() => run("set")} disabled={busy || qty === ""} className={btn}>Set</button>
      </div>
    </div>
  )
}
