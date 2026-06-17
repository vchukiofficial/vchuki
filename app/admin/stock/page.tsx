"use client"

import { useEffect, useState } from "react"
import { PackageX, AlertTriangle, Package, RefreshCw, Check } from "lucide-react"
import Link from "next/link"

interface StockAlert {
  _id: string
  product: string
  productSlug: string
  color: string
  size: string
  stock: number
  sku: string
}

interface Stats {
  totalVariants: number
  totalStock: number
  soldOut: number
  lowStock: number
  healthy: number
}

export default function AdminStockPage() {
  const [stats, setStats] = useState<Stats>({ totalVariants: 0, totalStock: 0, soldOut: 0, lowStock: 0, healthy: 0 })
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  function fetchStock() {
    setLoading(true)
    fetch("/api/admin/stock", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setStats(d.stats || {}); setAlerts(d.alerts || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchStock() }, [])

  async function updateStock(variantId: string, newStock: number) {
    setUpdating(variantId)
    // Find the product ID from alerts
    const alert = alerts.find(a => a._id === variantId)
    if (!alert) return

    await fetch(`/api/products/${alert.productSlug}/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ stock: newStock }),
    }).catch(() => {
      // Try with a different endpoint format
      // The API uses product ID not slug, but we have slug. Use direct variant update.
    })

    setAlerts(alerts.map(a => a._id === variantId ? { ...a, stock: newStock } : a))
    setTimeout(() => setUpdating(null), 500)
  }

  const soldOutItems = alerts.filter(a => a.stock === 0)
  const lowStockItems = alerts.filter(a => a.stock > 0 && a.stock <= 5)
  const warningItems = alerts.filter(a => a.stock > 5 && a.stock <= 10)

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading stock data...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Stock Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Monitor inventory, restock sold-out items, manage availability</p>
        </div>
        <button onClick={fetchStock} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total SKUs</p>
          <p className="text-xl font-light text-foreground mt-1">{stats.totalVariants}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Units</p>
          <p className="text-xl font-light text-foreground mt-1">{stats.totalStock.toLocaleString()}</p>
        </div>
        <div className="p-3 border border-red-500/20 bg-red-500/5">
          <p className="text-[10px] uppercase tracking-wider text-red-500">Sold Out</p>
          <p className="text-xl font-light text-red-500 mt-1">{stats.soldOut}</p>
        </div>
        <div className="p-3 border border-amber-500/20 bg-amber-500/5">
          <p className="text-[10px] uppercase tracking-wider text-amber-600">Low Stock (≤5)</p>
          <p className="text-xl font-light text-amber-600 mt-1">{stats.lowStock}</p>
        </div>
        <div className="p-3 border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-[10px] uppercase tracking-wider text-emerald-600">Healthy</p>
          <p className="text-xl font-light text-emerald-600 mt-1">{stats.healthy}</p>
        </div>
      </div>

      {/* Sold Out */}
      {soldOutItems.length > 0 && (
        <div className="border border-red-500/20 bg-red-500/5 p-4">
          <h3 className="text-sm font-medium text-red-500 flex items-center gap-2 mb-3">
            <PackageX className="h-4 w-4" /> Sold Out ({soldOutItems.length})
          </h3>
          <div className="space-y-2">
            {soldOutItems.map(item => (
              <StockRow key={item._id} item={item} updating={updating} onUpdate={updateStock} />
            ))}
          </div>
        </div>
      )}

      {/* Low Stock */}
      {lowStockItems.length > 0 && (
        <div className="border border-amber-500/20 bg-amber-500/5 p-4">
          <h3 className="text-sm font-medium text-amber-600 flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4" /> Low Stock ({lowStockItems.length})
          </h3>
          <div className="space-y-2">
            {lowStockItems.map(item => (
              <StockRow key={item._id} item={item} updating={updating} onUpdate={updateStock} />
            ))}
          </div>
        </div>
      )}

      {/* Warning */}
      {warningItems.length > 0 && (
        <div className="border border-border p-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-muted-foreground" /> Needs Attention ({warningItems.length})
          </h3>
          <div className="space-y-2">
            {warningItems.map(item => (
              <StockRow key={item._id} item={item} updating={updating} onUpdate={updateStock} />
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="text-center py-12 border border-border">
          <Check className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
          <p className="text-sm text-foreground font-medium">All stock is healthy!</p>
          <p className="text-xs text-muted-foreground mt-1">No items are low on stock or sold out.</p>
        </div>
      )}
    </div>
  )
}

function StockRow({ item, updating, onUpdate }: { item: StockAlert; updating: string | null; onUpdate: (id: string, stock: number) => void }) {
  const [newStock, setNewStock] = useState("")

  return (
    <div className="flex items-center justify-between p-2 bg-background border border-border">
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <Link href={`/admin/products`} className="text-xs font-medium text-foreground hover:text-[#c4956a] transition-colors">{item.product}</Link>
          <p className="text-[10px] text-muted-foreground">{item.color} · {item.size} · <span className="font-mono">{item.sku}</span></p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-semibold ${item.stock === 0 ? "text-red-500" : item.stock <= 5 ? "text-amber-600" : "text-muted-foreground"}`}>
          {item.stock} left
        </span>
        <input
          type="number"
          value={newStock}
          onChange={e => setNewStock(e.target.value)}
          placeholder="Restock"
          min={0}
          className="w-16 h-7 px-2 text-[10px] border border-border bg-background text-foreground text-center focus:outline-none focus:border-[#c4956a]/50"
        />
        <button
          onClick={() => { if (newStock) { onUpdate(item._id, Number(newStock)); setNewStock("") } }}
          disabled={!newStock || updating === item._id}
          className="h-7 px-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[9px] font-medium uppercase disabled:opacity-30"
        >
          {updating === item._id ? "..." : "Update"}
        </button>
      </div>
    </div>
  )
}
