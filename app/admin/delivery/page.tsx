"use client"

import { useEffect, useState } from "react"
import { Package, Truck, CheckCircle, Clock, AlertTriangle, MapPin, Phone, RefreshCw, XCircle } from "lucide-react"

const COURIER_COLORS: Record<string, string> = {
  "Delhivery": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Shiprocket": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "Blue Dart": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "DTDC": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-500", label: "Pending" },
  confirmed: { icon: Package, color: "text-blue-500", label: "Confirmed" },
  packaging: { icon: Package, color: "text-indigo-500", label: "Packaging" },
  dispatched: { icon: Truck, color: "text-cyan-500", label: "Dispatched" },
  shipped: { icon: Truck, color: "text-blue-600", label: "In Transit" },
  out_for_delivery: { icon: MapPin, color: "text-orange-500", label: "Out for Delivery" },
  delivered: { icon: CheckCircle, color: "text-emerald-500", label: "Delivered" },
  returned: { icon: AlertTriangle, color: "text-red-500", label: "Returned" },
  cancelled: { icon: XCircle, color: "text-red-500", label: "Cancelled" },
}

export default function AdminDeliveryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [pincodeCheck, setPincodeCheck] = useState("")
  const [pincodeResult, setPincodeResult] = useState<string | null>(null)

  function fetchOrders() {
    setLoading(true)
    fetch("/api/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ shippingStatus: status }),
    })
    setOrders(orders.map(o => o._id === id ? { ...o, shippingStatus: status } : o))
  }

  function checkPincode() {
    // Simulated pincode serviceability
    const serviceable = parseInt(pincodeCheck) >= 100000 && parseInt(pincodeCheck) <= 999999
    const couriers = serviceable ? ["Delhivery (2-3 days)", "Blue Dart (3-4 days)", "DTDC (4-5 days)"] : []
    setPincodeResult(serviceable ? `✓ Serviceable — ${couriers.join(", ")}` : "✗ Not serviceable at this pincode")
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.shippingStatus === filter)

  // Analytics
  const shippedOrders = orders.filter(o => ["shipped", "dispatched", "out_for_delivery"].includes(o.shippingStatus))
  const deliveredOrders = orders.filter(o => o.shippingStatus === "delivered")
  const pendingOrders = orders.filter(o => o.shippingStatus === "pending")
  const avgDeliveryDays = 3.2 // Simulated

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading shipments...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Delivery Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track shipments, assign couriers, manage deliveries</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="text-xl font-light text-foreground mt-1">{orders.length}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-amber-600">Pending</p>
          <p className="text-xl font-light text-foreground mt-1">{pendingOrders.length}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-blue-600">In Transit</p>
          <p className="text-xl font-light text-foreground mt-1">{shippedOrders.length}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-emerald-600">Delivered</p>
          <p className="text-xl font-light text-foreground mt-1">{deliveredOrders.length}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Days</p>
          <p className="text-xl font-light text-foreground mt-1">{avgDeliveryDays}</p>
        </div>
      </div>

      {/* Pincode Serviceability */}
      <div className="p-4 border border-border bg-card">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Pincode Serviceability Check</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={pincodeCheck}
            onChange={(e) => setPincodeCheck(e.target.value)}
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            className="px-3 py-2 border border-border bg-background text-xs w-40 focus:outline-none focus:border-[#c4956a]/50 text-foreground"
          />
          <button onClick={checkPincode} className="px-3 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider">
            Check
          </button>
        </div>
        {pincodeResult && <p className={`text-xs mt-2 ${pincodeResult.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>{pincodeResult}</p>}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-0.5 overflow-x-auto no-scrollbar border-b">
        {["all", "pending", "confirmed", "packaging", "dispatched", "shipped", "out_for_delivery", "delivered", "cancelled"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 text-[10px] capitalize border-b-2 transition-colors font-medium whitespace-nowrap ${filter === s ? "border-[#c4956a] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Shipments List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border border-border">No shipments in this category.</div>
        )}
        {filtered.map(order => {
          const config = STATUS_CONFIG[order.shippingStatus] || STATUS_CONFIG.pending
          const Icon = config.icon
          const courier = (order as any).courier
          const awb = (order as any).awb

          return (
            <div key={order._id} className="p-4 border border-border bg-card hover:border-[#c4956a]/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium font-mono text-foreground">#{order._id?.slice(-8).toUpperCase()}</p>
                      {courier && (
                        <span className={`text-[9px] px-1.5 py-0.5 font-medium ${COURIER_COLORS[courier] || "bg-muted text-muted-foreground"}`}>
                          {courier}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {order.shippingAddress?.name} · {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      {awb && <span className="ml-2 font-mono">AWB: {awb}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">₹{order.finalAmount?.toLocaleString()}</span>
                  <select
                    value={order.shippingStatus}
                    onChange={e => updateStatus(order._id, e.target.value)}
                    className="text-[10px] bg-background border border-border px-2 py-1.5 focus:outline-none focus:border-[#c4956a]/50 text-foreground"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery details */}
              {(order.shippingStatus === "shipped" || order.shippingStatus === "out_for_delivery") && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <div className="text-[10px] text-muted-foreground">
                    <span>ETA: 2-3 business days</span>
                    {order.shippingAddress?.phone && (
                      <span className="ml-3 flex items-center gap-1 inline-flex"><Phone className="h-2.5 w-2.5" /> {order.shippingAddress.phone}</span>
                    )}
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 font-medium ${config.color} bg-current/10`}>
                    {config.label}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
