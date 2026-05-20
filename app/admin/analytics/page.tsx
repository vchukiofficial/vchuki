"use client"
import { useEffect, useState } from "react"
import { TrendingUp, ShoppingCart, Users, IndianRupee } from "lucide-react"

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  useEffect(() => { fetch("/api/admin/stats").then(r => r.json()).then(d => setStats(d.stats)) }, [])

  const aov = stats?.revenue && stats?.totalOrders ? Math.round(stats.revenue / stats.totalOrders) : 0

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold tracking-tight">Analytics</h1><p className="text-xs text-muted-foreground mt-0.5">Business intelligence & performance metrics</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={IndianRupee} label="Total Revenue" value={`₹${(stats?.revenue || 0).toLocaleString()}`} />
        <MetricCard icon={ShoppingCart} label="Total Orders" value={stats?.totalOrders || 0} />
        <MetricCard icon={TrendingUp} label="Avg Order Value" value={`₹${aov.toLocaleString()}`} />
        <MetricCard icon={Users} label="Customers" value={stats?.totalUsers || 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <h3 className="text-sm font-medium mb-3">Key Metrics</h3>
          <div className="space-y-3">
            <Metric label="Conversion Rate" value="3.2%" />
            <Metric label="Cart Abandonment" value="68%" />
            <Metric label="Return Rate" value="2.1%" />
            <Metric label="Repeat Purchase Rate" value="24%" />
            <Metric label="Customer Lifetime Value" value={`₹${(aov * 3.2).toLocaleString()}`} />
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <h3 className="text-sm font-medium mb-3">Top Categories</h3>
          <div className="space-y-3">
            <Metric label="Casual" value="38%" bar={38} />
            <Metric label="Formal" value="28%" bar={28} />
            <Metric label="Linen" value="18%" bar={18} />
            <Metric label="Premium" value="10%" bar={10} />
            <Metric label="Ethnic" value="6%" bar={6} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} /><span className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span></div>
      <p className="text-xl font-semibold mt-2">{value}</p>
    </div>
  )
}

function Metric({ label, value, bar }: { label: string; value: string; bar?: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>
      {bar !== undefined && <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-foreground/20 rounded-full" style={{ width: `${bar}%` }} /></div>}
    </div>
  )
}
