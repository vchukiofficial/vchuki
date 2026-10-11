"use client"

import { useEffect } from "react"
import { useAdminStore } from "@/store/adminStore"
import { StatCard, StatusBadge, SectionHeader } from "@/components/admin/ui"
import { IndianRupee, ShoppingCart, Package, Users, TrendingUp, AlertTriangle, Tag, Star } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { stats, today, orders, products, reviews, loading, fetchStats, fetchOrders, fetchProducts, fetchReviews } = useAdminStore()

  useEffect(() => {
    fetchStats()
    fetchOrders()
    fetchProducts()
    fetchReviews()
  }, [fetchStats, fetchOrders, fetchProducts, fetchReviews])

  const isLoading = loading.stats

  const pendingOrders = orders.filter(o => o.shippingStatus === "pending").length
  const pendingReviews = reviews.filter((r: any) => r.status === "pending").length

  // "—" beats a fake number: null means there isn't enough data yet to compute a real change.
  const changeLabel = (pct: number | null | undefined, suffix = " vs last month") =>
    pct === null || pct === undefined ? "Not enough data yet" : `${pct >= 0 ? "+" : ""}${pct}%${suffix}`

  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard" description="Welcome back. Here's your business at a glance." />

      {stats && stats.staleOrderCount > 0 && (
        <Link
          href="/admin/orders"
          className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-700 dark:text-red-400 hover:bg-red-500/15 transition-colors"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <p className="text-xs font-medium">
            {stats.staleOrderCount} order{stats.staleOrderCount > 1 ? "s" : ""} unconfirmed for over 24 hours
            {stats.oldestStaleHours > 0 && ` — oldest is ${Math.floor(stats.oldestStaleHours / 24)}d ${stats.oldestStaleHours % 24}h old`}. Review now →
          </p>
        </Link>
      )}

      {/* Today — what needs attention right now. Each tile opens the page that handles it. */}
      {today && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2">Today</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <TodayTile href="/admin/orders" label="Website sales" value={`₹${today.onlineRevenue.toLocaleString("en-IN")}`} sub={`${today.onlineOrders} order${today.onlineOrders === 1 ? "" : "s"}`} />
            <TodayTile href="/admin/pos" label="Shop sales" value={`₹${today.storeRevenue.toLocaleString("en-IN")}`} sub={`${today.storeOrders} bill${today.storeOrders === 1 ? "" : "s"}`} />
            <TodayTile href="/admin/shipments" label="To ship" value={today.toShip} sub="Website orders not dispatched" tone={today.toShip > 0 ? "amber" : undefined} />
            <TodayTile href="/admin/stock" label="Stock alerts" value={today.outOfStock} sub={`sold out · ${today.lowStock} low (≤5)`} tone={today.outOfStock > 0 ? "red" : today.lowStock > 0 ? "amber" : undefined} />
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={IndianRupee} label="Revenue" value={isLoading ? "..." : `₹${(stats?.revenue || 0).toLocaleString()}`} change={changeLabel(stats?.revenueChangePct)} trend={stats?.revenueChangePct != null && stats.revenueChangePct >= 0 ? "up" : "down"} />
        <StatCard icon={ShoppingCart} label="Orders" value={isLoading ? "..." : stats?.totalOrders || 0} change={`${pendingOrders} pending`} />
        <StatCard icon={Package} label="Products" value={isLoading ? "..." : stats?.totalProducts || 0} change="Active in catalog" />
        <StatCard icon={Users} label="Customers" value={isLoading ? "..." : stats?.totalUsers || 0} change={changeLabel(stats?.customersChangePct)} trend={stats?.customersChangePct != null && stats.customersChangePct >= 0 ? "up" : "down"} />
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
              {stats && stats.staleOrderCount > 0 && (
                <AlertItem color="bg-red-500" text={`${stats.staleOrderCount} orders unconfirmed 24h+`} />
              )}
              <AlertItem color="bg-amber-500" text={`${pendingOrders} orders pending shipment`} />
              <AlertItem color="bg-blue-500" text={`${pendingReviews} reviews to moderate`} />
              <AlertItem color="bg-emerald-500" text={`${products.length} products active`} />
            </div>
          </div>

          {/* Performance — last 30 days, computed from real orders/sessions. "—" means not enough data yet. */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-xs font-medium mb-3 flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> Performance (30d)
            </h3>
            <div className="space-y-2.5">
              <MetricRow label="Online Revenue" value={stats ? `₹${(stats.onlineRevenue30 || 0).toLocaleString()}` : "—"} />
              <MetricRow label="Shop Revenue" value={stats ? `₹${(stats.storeRevenue30 || 0).toLocaleString()}` : "—"} />
              <MetricRow label="Avg Order Value" value={stats?.avgOrderValue ? `₹${stats.avgOrderValue.toLocaleString()}` : "—"} />
              <MetricRow label="Conversion Rate" value={stats?.conversionRatePct != null ? `${stats.conversionRatePct}%` : "—"} />
              <MetricRow label="Return Rate" value={stats?.returnRatePct != null ? `${stats.returnRatePct}%` : "—"} />
              <MetricRow label="Repeat Customers" value={stats?.repeatRatePct != null ? `${stats.repeatRatePct}%` : "—"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TodayTile({ href, label, value, sub, tone }: { href: string; label: string; value: string | number; sub: string; tone?: "amber" | "red" }) {
  const toneClass = tone === "red"
    ? "border-red-500/30 bg-red-500/5"
    : tone === "amber"
    ? "border-amber-500/30 bg-amber-500/5"
    : "bg-card hover:shadow-sm"
  return (
    <Link href={href} className={`p-4 rounded-lg border transition-all hover:border-[#c4956a]/40 ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl font-semibold mt-1 tracking-tight ${tone === "red" ? "text-red-600" : tone === "amber" ? "text-amber-600" : ""}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </Link>
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
