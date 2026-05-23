"use client"

import { useEffect, useState } from "react"
import { useAdminStore } from "@/store/adminStore"
import { StatusBadge, SectionHeader, EmptyState } from "@/components/admin/ui"
import { ShoppingCart, Package, Truck, Search, Download, ChevronDown } from "lucide-react"

const STATUSES = ["pending", "confirmed", "packaging", "dispatched", "shipped", "out_for_delivery", "delivered", "returned", "cancelled"] as const
const COURIERS = ["Delhivery", "Shiprocket", "Blue Dart", "DTDC"] as const

function generateAWB(courier: string) {
  const prefix = courier === "Delhivery" ? "DL" : courier === "Blue Dart" ? "BD" : courier === "DTDC" ? "DT" : "SR"
  return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`
}

export default function AdminOrdersPage() {
  const { orders, loading, fetchOrders, updateOrderStatus } = useAdminStore()
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [assigningCourier, setAssigningCourier] = useState<string | null>(null)

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const filtered = orders.filter(o => {
    if (filter !== "all" && o.shippingStatus !== filter) return false
    if (search && !o._id.includes(search) && !o.items?.some((i: any) => i.name?.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  })

  const counts: Record<string, number> = { all: orders.length }
  orders.forEach(o => { counts[o.shippingStatus] = (counts[o.shippingStatus] || 0) + 1 })

  async function handleStatusUpdate(id: string, status: string) {
    await updateOrderStatus(id, status)
  }

  async function handleAssignCourier(orderId: string, courier: string) {
    const awb = generateAWB(courier)
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingStatus: "dispatched",
        courier,
        awb,
        timeline: { event: `Assigned to ${courier} — AWB: ${awb}`, timestamp: new Date() },
      }),
    })
    fetchOrders()
    setAssigningCourier(null)
  }

  if (loading.orders) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading orders...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader title="Orders" description={`${orders.length} total orders`} />
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium uppercase tracking-wider hover:border-[#c4956a]/30 transition-colors text-foreground">
          <Download className="h-3 w-3" /> Export
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or product..."
            className="w-full pl-9 pr-4 py-2.5 border border-border bg-background text-xs focus:outline-none focus:border-[#c4956a]/50 transition-colors text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-0.5 overflow-x-auto no-scrollbar border-b">
        {["all", "pending", "confirmed", "packaging", "dispatched", "shipped", "delivered", "cancelled"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2.5 text-[10px] capitalize border-b-2 transition-colors font-medium whitespace-nowrap ${filter === s ? "border-[#c4956a] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {s} {counts[s] ? <span className="text-muted-foreground/60">({counts[s]})</span> : null}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders" description="Orders will appear here when customers place them." />
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const isExpanded = expandedOrder === order._id
            return (
              <div key={order._id} className="border border-border overflow-hidden hover:border-[#c4956a]/20 transition-colors">
                {/* Order Row */}
                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-medium font-mono text-foreground">#{order._id?.slice(-8).toUpperCase()}</p>
                      <p className="text-[10px] text-muted-foreground">{order.items?.length} items · {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.shippingStatus} />
                    <span className="text-sm font-semibold text-foreground">₹{order.finalAmount?.toLocaleString()}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border p-4 bg-card/30 space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Items */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Items</p>
                        <div className="space-y-1.5">
                          {order.items?.map((item: any, i: number) => (
                            <div key={i} className="text-xs text-foreground">
                              {item.name} <span className="text-muted-foreground">({item.size}/{item.color}) ×{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer & Address */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Shipping</p>
                        <div className="text-xs space-y-0.5">
                          <p className="font-medium text-foreground">{(order as any).shippingAddress?.name}</p>
                          <p className="text-muted-foreground">{(order as any).shippingAddress?.street}</p>
                          <p className="text-muted-foreground">{(order as any).shippingAddress?.city}, {(order as any).shippingAddress?.state} - {(order as any).shippingAddress?.zip}</p>
                          <p className="text-muted-foreground">{(order as any).shippingAddress?.phone}</p>
                        </div>
                      </div>

                      {/* Payment & Delivery */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Payment</p>
                        <div className="text-xs space-y-1">
                          <p className="text-foreground capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}</p>
                          <p className={order.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"}>{order.paymentStatus}</p>
                          <p className="text-muted-foreground">Total: ₹{order.finalAmount?.toLocaleString()}</p>
                          {order.discountAmount > 0 && <p className="text-emerald-600">Discount: -₹{order.discountAmount}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mr-2">Update Status:</p>
                      <select
                        value={order.shippingStatus}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="text-[11px] bg-background border border-border px-3 py-1.5 focus:outline-none focus:border-[#c4956a]/50 text-foreground"
                      >
                        {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace("_", " ")}</option>)}
                      </select>

                      {/* Assign Courier */}
                      {(order.shippingStatus === "packaging" || order.shippingStatus === "confirmed") && (
                        <>
                          {assigningCourier === order._id ? (
                            <div className="flex gap-1.5">
                              {COURIERS.map(c => (
                                <button key={c} onClick={() => handleAssignCourier(order._id, c)} className="text-[10px] px-2.5 py-1.5 border border-border hover:border-[#c4956a]/40 hover:bg-[#c4956a]/5 transition-colors text-foreground">
                                  {c}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button onClick={() => setAssigningCourier(order._id)} className="flex items-center gap-1 text-[10px] px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] font-medium uppercase tracking-wider hover:opacity-90 transition-opacity">
                              <Truck className="h-3 w-3" /> Assign Courier
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Timeline */}
                    {(order as any).timeline?.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Timeline</p>
                        <div className="space-y-1.5 pl-3 border-l-2 border-[#c4956a]/20">
                          {(order as any).timeline.map((event: any, i: number) => (
                            <div key={i} className="relative">
                              <div className="absolute -left-[13px] top-1 h-2 w-2 rounded-full bg-[#c4956a]" />
                              <p className="text-xs text-foreground pl-2">{event.event}</p>
                              <p className="text-[10px] text-muted-foreground pl-2">{new Date(event.timestamp).toLocaleString("en-IN")}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
