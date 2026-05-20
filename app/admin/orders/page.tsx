"use client"

import { useEffect, useState } from "react"
import { useAdminStore } from "@/store/adminStore"
import { StatusBadge, SectionHeader, EmptyState } from "@/components/admin/ui"
import { ShoppingCart } from "lucide-react"

export default function AdminOrdersPage() {
  const { orders, loading, fetchOrders, updateOrderStatus } = useAdminStore()
  const [filter, setFilter] = useState("all")

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const filtered = filter === "all" ? orders : orders.filter(o => o.shippingStatus === filter)
  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.shippingStatus === "pending").length,
    shipped: orders.filter(o => o.shippingStatus === "shipped").length,
    delivered: orders.filter(o => o.shippingStatus === "delivered").length,
  }

  if (loading.orders) return <div className="text-sm text-muted-foreground animate-pulse">Loading orders...</div>

  return (
    <div className="space-y-4">
      <SectionHeader title="Orders" description={`${orders.length} total orders`} />

      {/* Tabs */}
      <div className="flex gap-0.5 border-b">
        {(["all", "pending", "shipped", "delivered"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2.5 text-[11px] capitalize border-b-2 transition-colors font-medium ${filter === s ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {s} <span className="text-muted-foreground font-normal">({counts[s as keyof typeof counts] || 0})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders" description="Orders will appear here when customers place them." />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="p-3 font-medium">Order</th>
                <th className="p-3 font-medium hidden md:table-cell">Items</th>
                <th className="p-3 font-medium">Amount</th>
                <th className="p-3 font-medium">Payment</th>
                <th className="p-3 font-medium">Shipping</th>
                <th className="p-3 font-medium hidden md:table-cell">Date</th>
                <th className="p-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((order) => (
                <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono font-medium">#{order._id?.slice(-8)}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{order.items?.length} items</td>
                  <td className="p-3 font-medium">₹{order.finalAmount?.toLocaleString()}</td>
                  <td className="p-3"><StatusBadge status={order.paymentStatus} /></td>
                  <td className="p-3"><StatusBadge status={order.shippingStatus} /></td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <select
                      value={order.shippingStatus}
                      onChange={e => updateOrderStatus(order._id, e.target.value)}
                      className="text-[10px] bg-background border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    >
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
        </div>
      )}
    </div>
  )
}
