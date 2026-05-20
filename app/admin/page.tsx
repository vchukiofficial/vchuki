"use client"

import { useEffect } from "react"
import { useAdminStore } from "@/store/adminStore"
import { StatCard, StatusBadge, SectionHeader } from "@/components/admin/ui"
import { IndianRupee, ShoppingCart, Package, Users, TrendingUp, AlertTriangle, Tag, Star } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { stats, orders, products, reviews, loading, fetchStats, fetchOrders, fetchProducts, fetchReviews } = useAdminStore()

  useEffect(() => {
    fetchStats()
    fetchOrders()
    fetchProducts()
    fetchReviews()
  }, [fetchStats, fetchOrders, fetchProducts, fetchReviews])

  const isLoading = loading.stats

  const pendingOrders = orders.filter(o => o.shippingStatus === "pending").length
  const pendingReviews = reviews.length
  const aov = stats?.revenue && stats?.totalOrders ? Math.round(stats.revenue / stats.totalOrders) : 0

  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard" description="Welcome back. Here's your business at a glance." />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={IndianRupee} label="Revenue" value={isLoading ? "..." : `₹${(stats?.revenue || 0).toLocaleString()}`} change="+12.5% vs last month" trend="up" />
        <StatCard icon={ShoppingCart} label="Orders" value={isLoading ? "..." : stats?.totalOrders || 0} change={`${pendingOrders} pending`} />
        <StatCard icon={Package} label="Products" value={isLoading ? "..." : stats?.totalProducts || 0} change="Active in catalog" />
        <StatCard icon={Users} label="Customers" value={isLoading ? "..." : stats?.totalUsers || 0} change="+15% this month" trend="up" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-lg border bg-card">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-sm font-medium">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {orders.slice(0, 7).map((order) => (
              <div key={order._id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium font-mono">#{order._id?.slice(-8)}</p>
                    <p className="text-[10px] text-muted-foreground">{order.items?.length || 0} items · {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <StatusBadge status={order.shippingStatus} />
                  <p className="text-xs font-medium w-16 text-right">₹{order.finalAmount?.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="p-6 text-center text-xs text-muted-foreground">No orders yet.</p>}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-xs font-medium mb-3 uppercase tracking-wider text-muted-foreground">Quick Actions</h3>
            <div className="space-y-1.5">
              {[
                { href: "/admin/products", icon: Package, label: "Add Product", color: "text-blue-500" },
                { href: "/admin/coupons", icon: Tag, label: "Create Coupon", color: "text-purple-500" },
                { href: "/admin/orders", icon: ShoppingCart, label: "Process Orders", color: "text-amber-500" },
                { href: "/admin/reviews", icon: Star, label: "Moderate Reviews", color: "text-emerald-500" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} strokeWidth={1.5} />
                  <span className="text-xs">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-xs font-medium mb-3 flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="h-3 w-3 text-amber-500" /> Alerts
            </h3>
            <div className="space-y-2">
              <AlertItem color="bg-amber-500" text={`${pendingOrders} orders pending shipment`} />
              <AlertItem color="bg-blue-500" text={`${pendingReviews} reviews to moderate`} />
              <AlertItem color="bg-emerald-500" text={`${products.length} products active`} />
            </div>
          </div>

          {/* Performance */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-xs font-medium mb-3 flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> Performance
            </h3>
            <div className="space-y-2.5">
              <MetricRow label="Avg Order Value" value={`₹${aov.toLocaleString()}`} />
              <MetricRow label="Conversion Rate" value="3.2%" />
              <MetricRow label="Return Rate" value="2.1%" />
              <MetricRow label="Repeat Customers" value="24%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertItem({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {text}
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
