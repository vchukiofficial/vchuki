"use client"

import { useEffect, useState } from "react"
import { TrendingUp, ShoppingCart, Users, IndianRupee, Eye, MousePointer, Clock, Smartphone, Monitor, Globe } from "lucide-react"

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [liveVisitors, setLiveVisitors] = useState(Math.floor(Math.random() * 20) + 5)

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" }).then(r => r.json()).then(d => setStats(d.stats))
    // Simulate live visitors
    const interval = setInterval(() => {
      setLiveVisitors(prev => Math.max(1, prev + Math.floor(Math.random() * 5) - 2))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const aov = stats?.revenue && stats?.totalOrders ? Math.round(stats.revenue / stats.totalOrders) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Business intelligence & real-time metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/30 bg-emerald-500/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{liveVisitors} live visitors</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={IndianRupee} label="Revenue" value={`₹${(stats?.revenue || 0).toLocaleString()}`} change="+12.5%" trend="up" />
        <KPI icon={ShoppingCart} label="Orders" value={stats?.totalOrders || 0} change="+8.3%" trend="up" />
        <KPI icon={TrendingUp} label="AOV" value={`₹${aov.toLocaleString()}`} change="+5.1%" trend="up" />
        <KPI icon={Users} label="Customers" value={stats?.totalUsers || 0} change="+15%" trend="up" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <div className="p-4 border border-border bg-card">
          <h3 className="text-sm font-medium text-foreground mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            <FunnelStep label="Page Views" value="12,450" pct={100} />
            <FunnelStep label="Product Views" value="4,820" pct={38.7} />
            <FunnelStep label="Add to Cart" value="1,240" pct={9.9} />
            <FunnelStep label="Checkout Started" value="680" pct={5.4} />
            <FunnelStep label="Order Placed" value="398" pct={3.2} />
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="p-4 border border-border bg-card">
          <h3 className="text-sm font-medium text-foreground mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            <SourceRow label="Instagram" value="42%" color="bg-pink-500" />
            <SourceRow label="Google Organic" value="28%" color="bg-blue-500" />
            <SourceRow label="Direct" value="15%" color="bg-emerald-500" />
            <SourceRow label="Facebook Ads" value="10%" color="bg-indigo-500" />
            <SourceRow label="WhatsApp" value="5%" color="bg-green-500" />
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="p-4 border border-border bg-card">
          <h3 className="text-sm font-medium text-foreground mb-4">Device Breakdown</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 border border-border">
              <Smartphone className="h-4 w-4 mx-auto text-[#c4956a]" />
              <p className="text-lg font-light text-foreground mt-1">72%</p>
              <p className="text-[9px] text-muted-foreground">Mobile</p>
            </div>
            <div className="p-3 border border-border">
              <Monitor className="h-4 w-4 mx-auto text-blue-500" />
              <p className="text-lg font-light text-foreground mt-1">22%</p>
              <p className="text-[9px] text-muted-foreground">Desktop</p>
            </div>
            <div className="p-3 border border-border">
              <Globe className="h-4 w-4 mx-auto text-emerald-500" />
              <p className="text-lg font-light text-foreground mt-1">6%</p>
              <p className="text-[9px] text-muted-foreground">Tablet</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="p-4 border border-border bg-card">
          <h3 className="text-sm font-medium text-foreground mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <MetricRow icon={Eye} label="Avg Session Duration" value="3m 42s" />
            <MetricRow icon={MousePointer} label="Bounce Rate" value="34.2%" />
            <MetricRow icon={ShoppingCart} label="Cart Abandonment" value="68%" />
            <MetricRow icon={TrendingUp} label="Conversion Rate" value="3.2%" />
            <MetricRow icon={Clock} label="Avg Time to Purchase" value="2.4 days" />
            <MetricRow icon={Users} label="Repeat Purchase Rate" value="24%" />
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="p-4 border border-border bg-card">
        <h3 className="text-sm font-medium text-foreground mb-4">Top Selling Products</h3>
        <div className="space-y-2">
          {[
            { name: "Desert Sand Linen Shirt", sold: 142, revenue: 113358 },
            { name: "Royal Indigo Linen Shirt", sold: 98, revenue: 88102 },
            { name: "Ivory Cream Linen Shirt", sold: 87, revenue: 69513 },
            { name: "Sage Linen Shirt", sold: 76, revenue: 60724 },
            { name: "Heritage Gold Linen Shirt", sold: 45, revenue: 58455 },
          ].map((product, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground w-4">{i + 1}.</span>
                <span className="text-xs text-foreground">{product.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground">{product.sold} sold</span>
                <span className="text-xs font-medium text-foreground">₹{product.revenue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic */}
      <div className="p-4 border border-border bg-card">
        <h3 className="text-sm font-medium text-foreground mb-4">Top Cities</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { city: "Mumbai", pct: 22 },
            { city: "Delhi", pct: 18 },
            { city: "Bangalore", pct: 15 },
            { city: "Jaipur", pct: 12 },
            { city: "Hyderabad", pct: 9 },
          ].map(item => (
            <div key={item.city} className="text-center p-2 border border-border">
              <p className="text-xs font-medium text-foreground">{item.city}</p>
              <p className="text-lg font-light text-[#c4956a] mt-0.5">{item.pct}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function KPI({ icon: Icon, label, value, change, trend }: { icon: any; label: string; value: any; change: string; trend: "up" | "down" }) {
  return (
    <div className="p-4 border border-border bg-card">
      <div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span></div>
      <p className="text-xl font-light text-foreground mt-2">{value}</p>
      <p className={`text-[10px] mt-1 ${trend === "up" ? "text-emerald-600" : "text-red-500"}`}>{change} vs last month</p>
    </div>
  )
}

function FunnelStep({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">{value} ({pct.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-border overflow-hidden">
        <div className="h-full bg-[#c4956a]/60" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function SourceRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-xs text-foreground">{label}</span>
      </div>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  )
}

function MetricRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  )
}
