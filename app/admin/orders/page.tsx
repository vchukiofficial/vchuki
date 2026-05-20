"use client"

import { useEffect, useState } from "react"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  shipped: "bg-blue-500/10 text-blue-600",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-red-500/10 text-red-600",
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/orders").then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false) })
  }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shippingStatus: status }) })
    setOrders(orders.map(o => o._id === id ? { ...o, shippingStatus: status } : o))
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.shippingStatus === filter)
  const counts = { all: orders.length, pending: orders.filter(o => o.shippingStatus === "pending").length, shipped: orders.filter(o => o.shippingStatus === "shipped").length, delivered: orders.filter(o => o.shippingStatus === "delivered").length }

  if (loading) return <div className="text-sm text-muted-foreground">Loading orders...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["all", "pending", "shipped", "delivered"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 text-xs capitalize border-b-2 transition-colors ${filter === s ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {s} ({counts[s as keyof typeof counts] || 0})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium hidden md:table-cell">Items</th>
              <th className="p-3 font-medium">Amount</th>
              <th className="p-3 font-medium">Payment</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium hidden md:table-cell">Date</th>
              <th className="p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((order) => (
              <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-mono font-medium">#{order._id?.slice(-8)}</td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{order.items?.length} items</td>
                <td className="p-3 font-medium">₹{order.finalAmount?.toLocaleString()}</td>
                <td className="p-3"><span className={`px-1.5 py-0.5 rounded text-[10px] ${order.paymentStatus === "paid" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}`}>{order.paymentStatus}</span></td>
                <td className="p-3"><span className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${statusColors[order.shippingStatus] || ""}`}>{order.shippingStatus}</span></td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <select value={order.shippingStatus} onChange={e => updateStatus(order._id, e.target.value)} className="text-[10px] bg-transparent border rounded px-1.5 py-1">
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No orders found.</p>}
      </div>
    </div>
  )
}
