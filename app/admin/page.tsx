"use client"

import { useEffect, useState } from "react"
import { IndianRupee, ShoppingCart, Package, Users, TrendingUp, AlertTriangle, Tag } from "lucide-react"
import Link from "next/link"

interface Stats {
  totalOrders: number
  totalProducts: number
  totalUsers: number
  revenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data.stats); setRecentOrders(data.recentOrders || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  const kpis = [
    { label: "Revenue", value: `₹${(stats?.revenue || 0).toLocaleString()}`, icon: IndianRupee, change: "+12.5%", positive: true },
    { label: "Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, change: "+8.2%", positive: true },
    { label: "Products", value: stats?.totalProducts || 0, icon: Package, change: "Active", positive: true },
    { label: "Customers", value: stats?.totalUsers || 0, icon: Users, change: "+15.3%", positive: true },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Welcome back. Here&apos;s your business overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
              <kpi.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-semibold mt-2 tracking-tight">{kpi.value}</p>
            <p className={`text-[11px] mt-1 ${kpi.positive ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
              {kpi.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-lg border bg-card">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-sm font-medium">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">View all →</Link>
          </div>
          <div className="divide-y">
            {recentOrders.slice(0, 6).map((order: any) => (
              <div key={order._id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs font-medium font-mono">#{order._id?.slice(-8)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {order.items?.length || 0} items · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">₹{order.finalAmount?.toLocaleString()}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                    order.shippingStatus === "delivered" ? "bg-green-500/10 text-green-600" :
                    order.shippingStatus === "shipped" ? "bg-blue-500/10 text-blue-600" :
                    order.shippingStatus === "cancelled" ? "bg-red-500/10 text-red-600" :
                    "bg-yellow-500/10 text-yellow-600"
                  }`}>
                    {order.shippingStatus}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground text-center">No orders yet.</p>
            )}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-medium mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/admin/products" className="flex items-center gap-2 px-3 py-2 rounded-md text-xs bg-foreground/[0.03] hover:bg-foreground/[0.06] transition-colors">
                <Package className="h-3.5 w-3.5" /> Add New Product
              </Link>
              <Link href="/admin/coupons" className="flex items-center gap-2 px-3 py-2 rounded-md text-xs bg-foreground/[0.03] hover:bg-foreground/[0.06] transition-colors">
                <Tag className="h-3.5 w-3.5" /> Create Coupon
              </Link>
              <Link href="/admin/orders" className="flex items-center gap-2 px-3 py-2 rounded-md text-xs bg-foreground/[0.03] hover:bg-foreground/[0.06] transition-colors">
                <ShoppingCart className="h-3.5 w-3.5" /> Process Orders
              </Link>
            </div>
          </div>

          {/* Alerts */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-medium mb-3 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" /> Alerts
            </h2>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                5 products low on stock
              </p>
              <p className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                3 orders pending shipment
              </p>
              <p className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                12 new reviews to moderate
              </p>
            </div>
          </div>

          {/* Performance */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-medium mb-3 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-green-500" /> Performance
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Conversion Rate</span>
                <span className="font-medium">3.2%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Avg Order Value</span>
                <span className="font-medium">₹{stats?.revenue && stats?.totalOrders ? Math.round(stats.revenue / stats.totalOrders).toLocaleString() : "0"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Return Rate</span>
                <span className="font-medium">2.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div><div className="h-6 w-32 bg-muted rounded animate-pulse" /><div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />)}
      </div>
    </div>
  )
}
