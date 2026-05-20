"use client"

import { useEffect, useState } from "react"

interface Order {
  _id: string
  finalAmount: number
  paymentStatus: string
  paymentMethod: string
  shippingStatus: string
  createdAt: string
  items: { name: string; quantity: number }[]
}

const statusOptions = ["pending", "shipped", "delivered", "cancelled"]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders || []); setLoading(false) })
  }, [])

  async function updateStatus(id: string, shippingStatus: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingStatus }),
    })
    setOrders(orders.map((o) => o._id === id ? { ...o, shippingStatus } : o))
  }

  if (loading) return <div className="text-muted-foreground">Loading orders...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders ({orders.length})</h1>

      <div className="rounded-lg border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/50">
            <tr className="text-left text-muted-foreground">
              <th className="p-3">Order</th>
              <th className="p-3">Items</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t border-border/50">
                <td className="p-3 font-mono text-xs">#{order._id.slice(-8)}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                </td>
                <td className="p-3 font-medium">₹{order.finalAmount.toLocaleString()}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${order.paymentStatus === "paid" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="p-3">
                  <select
                    value={order.shippingStatus}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="bg-secondary border border-border/50 rounded px-2 py-1 text-xs capitalize"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
