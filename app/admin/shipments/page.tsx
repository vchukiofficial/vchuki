"use client"

import { useEffect, useState } from "react"
import { Truck, CheckCircle, Clock, AlertTriangle, Download, Printer } from "lucide-react"

export default function AdminShipmentsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkCourier, setBulkCourier] = useState("Delhivery")

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false) })
  }, [])

  const shipments = orders.filter(o => ["dispatched", "shipped", "out_for_delivery"].includes(o.shippingStatus))
  const readyToShip = orders.filter(o => ["confirmed", "packaging"].includes(o.shippingStatus))
  const delivered = orders.filter(o => o.shippingStatus === "delivered")

  function selectAll() {
    if (selected.size === readyToShip.length) setSelected(new Set())
    else setSelected(new Set(readyToShip.map(o => o._id)))
  }

  function toggleSelect(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  async function bulkDispatch() {
    for (const id of selected) {
      const awb = `${bulkCourier.substring(0, 2).toUpperCase()}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
      await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ shippingStatus: "dispatched", courier: bulkCourier, awb }),
      })
    }
    setSelected(new Set())
    // Refresh
    const res = await fetch("/api/orders", { credentials: "include" })
    const d = await res.json()
    setOrders(d.orders || [])
  }

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading shipments...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Shipments</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Bulk processing, AWB generation & tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            <Download className="h-3 w-3" /> Export CSV
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            <Printer className="h-3 w-3" /> Print Labels
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Clock} label="Ready to Ship" value={readyToShip.length} color="text-amber-500" />
        <Stat icon={Truck} label="In Transit" value={shipments.length} color="text-blue-500" />
        <Stat icon={CheckCircle} label="Delivered" value={delivered.length} color="text-emerald-500" />
        <Stat icon={AlertTriangle} label="Delayed" value={shipments.filter(o => !o.courier).length} color="text-red-500" />
      </div>

      {/* Bulk Processing */}
      {readyToShip.length > 0 && (
        <div className="border border-[#c4956a]/20 bg-[#c4956a]/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-foreground">Ready to Ship ({readyToShip.length})</p>
              <p className="text-[10px] text-muted-foreground">Select orders for bulk dispatch</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={bulkCourier} onChange={e => setBulkCourier(e.target.value)} className="text-[10px] border border-border bg-background px-2 py-1.5 text-foreground">
                <option>Delhivery</option>
                <option>Shiprocket</option>
                <option>Blue Dart</option>
                <option>DTDC</option>
              </select>
              <button onClick={bulkDispatch} disabled={selected.size === 0} className="px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider disabled:opacity-40">
                Dispatch ({selected.size})
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={selected.size === readyToShip.length} onChange={selectAll} className="accent-[#c4956a]" />
              Select All
            </label>
            {readyToShip.map(order => (
              <label key={order._id} className={`flex items-center justify-between p-3 border cursor-pointer transition-colors ${selected.has(order._id) ? "border-[#c4956a]/40 bg-[#c4956a]/5" : "border-border bg-background"}`}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selected.has(order._id)} onChange={() => toggleSelect(order._id)} className="accent-[#c4956a]" />
                  <div>
                    <p className="text-xs font-mono font-medium text-foreground">#{order._id?.slice(-8).toUpperCase()}</p>
                    <p className="text-[10px] text-muted-foreground">{order.shippingAddress?.city}, {order.shippingAddress?.state} · {order.items?.length} items</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-foreground">₹{order.finalAmount?.toLocaleString()}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Active Shipments */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Active Shipments ({shipments.length})</p>
        {shipments.length === 0 ? (
          <div className="text-center py-8 border border-border text-sm text-muted-foreground">No active shipments</div>
        ) : (
          <div className="space-y-2">
            {shipments.map(order => (
              <div key={order._id} className="p-3 border border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono font-medium text-foreground">#{order._id?.slice(-8).toUpperCase()}</p>
                      {order.courier && <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">{order.courier}</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {order.shippingAddress?.city} · {order.awb ? `AWB: ${order.awb}` : "No AWB"}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 font-medium uppercase tracking-wider ${
                  order.shippingStatus === "out_for_delivery" ? "bg-orange-500/10 text-orange-600" :
                  order.shippingStatus === "shipped" ? "bg-blue-500/10 text-blue-600" :
                  "bg-cyan-500/10 text-cyan-600"
                }`}>
                  {order.shippingStatus.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="p-3 border border-border bg-card">
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-light text-foreground mt-1">{value}</p>
    </div>
  )
}
