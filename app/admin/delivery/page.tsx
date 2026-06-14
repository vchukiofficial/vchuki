"use client"

import { useEffect, useState } from "react"
import { Package, Truck, CheckCircle, Clock, AlertTriangle, MapPin, Phone, RefreshCw, XCircle, Download, Trash2 } from "lucide-react"
import { exportToExcel } from "@/lib/admin/exportExcel"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

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
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pincodeCheck, setPincodeCheck] = useState("")
  const [pincodeResult, setPincodeResult] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "single" | "bulk"; id?: string }>({ open: false, type: "single" })
  const [deleting, setDeleting] = useState(false)

  function fetchOrders() {
    setLoading(true)
    fetch("/api/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const filtered = filter === "all" ? orders : orders.filter(o => o.shippingStatus === filter)

  function toggleSelect(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(o => o._id)))
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      if (deleteDialog.type === "bulk") {
        for (const id of selected) {
          await fetch(`/api/orders/${id}`, { method: "DELETE", credentials: "include" })
        }
        setSelected(new Set())
      } else if (deleteDialog.id) {
        await fetch(`/api/orders/${deleteDialog.id}`, { method: "DELETE", credentials: "include" })
      }
      fetchOrders()
    } finally {
      setDeleting(false)
      setDeleteDialog({ open: false, type: "single" })
    }
  }

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
    const serviceable = parseInt(pincodeCheck) >= 100000 && parseInt(pincodeCheck) <= 999999
    const couriers = serviceable ? ["Delhivery (2-3 days)", "Blue Dart (3-4 days)", "DTDC (4-5 days)"] : []
    setPincodeResult(serviceable ? `✓ Serviceable — ${couriers.join(", ")}` : "✗ Not serviceable at this pincode")
  }

  async function handleExport() {
    const exportData = filtered.map(o => ({
      orderId: `#${o._id?.slice(-8).toUpperCase()}`,
      status: STATUS_CONFIG[o.shippingStatus]?.label || o.shippingStatus,
      courier: o.courier || "Not Assigned",
      awb: o.awb || "—",
      customer: o.shippingAddress?.name || "",
      phone: o.shippingAddress?.phone || "",
      city: o.shippingAddress?.city || "",
      state: o.shippingAddress?.state || "",
      pincode: o.shippingAddress?.zip || "",
      amount: `₹${o.finalAmount?.toLocaleString()}`,
    }))
    await exportToExcel({
      title: "Delivery Report",
      sheetName: "Deliveries",
      filename: "VCHUKI_Deliveries",
      columns: [
        { header: "Order ID", key: "orderId", width: 14 },
        { header: "Status", key: "status", width: 16 },
        { header: "Courier", key: "courier", width: 14 },
        { header: "AWB", key: "awb", width: 20 },
        { header: "Customer", key: "customer", width: 20 },
        { header: "Phone", key: "phone", width: 14 },
        { header: "City", key: "city", width: 14 },
        { header: "State", key: "state", width: 14 },
        { header: "Pincode", key: "pincode", width: 10 },
        { header: "Amount", key: "amount", width: 12 },
      ],
      data: exportData,
    })
  }

  const shippedOrders = orders.filter(o => ["shipped", "dispatched", "out_for_delivery"].includes(o.shippingStatus))
  const deliveredOrders = orders.filter(o => o.shippingStatus === "delivered")
  const pendingOrders = orders.filter(o => o.shippingStatus === "pending")

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading shipments...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Delivery Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track shipments, assign couriers, manage deliveries</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={() => setDeleteDialog({ open: true, type: "bulk" })} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-red-600 transition-colors">
              <Trash2 className="h-3 w-3" /> Delete ({selected.size})
            </button>
          )}
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            <Download className="h-3 w-3" /> Export Excel
          </button>
          <button onClick={fetchOrders} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 border border-border bg-card"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p><p className="text-xl font-light text-foreground mt-1">{orders.length}</p></div>
        <div className="p-3 border border-border bg-card"><p className="text-[10px] uppercase tracking-wider text-amber-600">Pending</p><p className="text-xl font-light text-foreground mt-1">{pendingOrders.length}</p></div>
        <div className="p-3 border border-border bg-card"><p className="text-[10px] uppercase tracking-wider text-blue-600">In Transit</p><p className="text-xl font-light text-foreground mt-1">{shippedOrders.length}</p></div>
        <div className="p-3 border border-border bg-card"><p className="text-[10px] uppercase tracking-wider text-emerald-600">Delivered</p><p className="text-xl font-light text-foreground mt-1">{deliveredOrders.length}</p></div>
        <div className="p-3 border border-border bg-card"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Days</p><p className="text-xl font-light text-foreground mt-1">3.2</p></div>
      </div>

      {/* Pincode Serviceability */}
      <div className="p-4 border border-border bg-card">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Pincode Serviceability Check</p>
        <div className="flex gap-2">
          <input type="text" value={pincodeCheck} onChange={(e) => setPincodeCheck(e.target.value)} placeholder="Enter 6-digit pincode" maxLength={6} className="px-3 py-2 border border-border bg-background text-xs w-40 focus:outline-none focus:border-[#c4956a]/50 text-foreground" />
          <button onClick={checkPincode} className="px-3 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider">Check</button>
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

      {/* Select All */}
      {filtered.length > 0 && (
        <label className="flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-[#c4956a]" />
          Select All ({filtered.length})
        </label>
      )}

      {/* Shipments List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border border-border">No shipments in this category.</div>
        )}
        {filtered.map(order => {
          const config = STATUS_CONFIG[order.shippingStatus] || STATUS_CONFIG.pending
          const Icon = config.icon
          const courier = order.courier
          const awb = order.awb

          return (
            <div key={order._id} className={`p-4 border bg-card transition-colors ${selected.has(order._id) ? "border-[#c4956a]/30 bg-[#c4956a]/5" : "border-border hover:border-[#c4956a]/20"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selected.has(order._id)} onChange={() => toggleSelect(order._id)} className="accent-[#c4956a]" />
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
                  <button onClick={() => setDeleteDialog({ open: true, type: "single", id: order._id })} className="h-6 w-6 border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>

              {(order.shippingStatus === "shipped" || order.shippingStatus === "out_for_delivery") && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <div className="text-[10px] text-muted-foreground">
                    <span>ETA: 2-3 business days</span>
                    {order.shippingAddress?.phone && (
                      <span className="ml-3 inline-flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> {order.shippingAddress.phone}</span>
                    )}
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 font-medium ${config.color}`}>{config.label}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: "single" })}
        onConfirm={confirmDelete}
        title={deleteDialog.type === "bulk" ? `Delete ${selected.size} Record(s)?` : "Delete Delivery Record?"}
        description={deleteDialog.type === "bulk"
          ? `You are about to permanently delete ${selected.size} delivery record(s). This will also remove the associated orders.`
          : "This delivery record and associated order will be permanently deleted."
        }
        confirmText="Delete Permanently"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
