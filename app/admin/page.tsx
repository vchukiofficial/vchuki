"use client"

import { useEffect, useState } from "react"
import { Package, ShoppingCart, Users, IndianRupee } from "lucide-react"

interface Stats {
  totalOrders: number
  totalProducts: number
  totalUsers: number
  revenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats)
        setRecentOrders(data.recentOrders || [])
      })
  }, [])

  if (!stats) return <div className="text-muted-foreground">Loading dashboard...</div>

  const cards = [
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: "text-green-500" },
    { label: "Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-blue-500" },
    { label: "Products", value: stats.totalProducts, icon: Package, color: "text-primary" },
    { label: "Users", value: stats.totalUsers, icon: Users, color: "text-purple-500" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-semibold mb-3">Recent Orders</h2>
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/50">
            <tr className="text-left text-muted-foreground">
              <th className="p-3">Order ID</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order: any) => (
              <tr key={order._id} className="border-t border-border/50">
                <td className="p-3 font-mono text-xs">#{order._id.slice(-8)}</td>
                <td className="p-3">₹{order.finalAmount?.toLocaleString()}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded ${order.paymentStatus === "paid" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>{order.paymentStatus}</span></td>
                <td className="p-3"><span className="text-xs capitalize">{order.shippingStatus}</span></td>
                <td className="p-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
