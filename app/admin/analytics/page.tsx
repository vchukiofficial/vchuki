"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Users, IndianRupee, Package, Download, Eye, Smartphone, Monitor, Tablet, Clock, Globe, Activity } from "lucide-react"
import { exportToExcel } from "@/lib/admin/exportExcel"

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [tracking, setTracking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats", { credentials: "include" }).then(r => r.json()),
      fetch(`/api/analytics?days=${days}`, { credentials: "include" }).then(r => r.json()),
    ]).then(([s, t]) => {
      setStats(s.stats)
      setTracking(t)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [days])

  const aov = stats?.revenue && stats?.totalOrders ? Math.round(stats.revenue / stats.totalOrders) : 0

  async function handleExport() {
    const exportData = [
      { metric: "Total Page Views", value: String(tracking?.totalViews || 0) },
      { metric: "Unique Sessions", value: String(tracking?.uniqueSessions || 0) },
      { metric: "Today's Views", value: String(tracking?.todayViews || 0) },
      { metric: "Revenue", value: `₹${(stats?.revenue || 0).toLocaleString()}` },
      { metric: "Orders", value: String(stats?.totalOrders || 0) },
      { metric: "Customers", value: String(stats?.totalUsers || 0) },
      ...(tracking?.pageBreakdown || []).map((p: any) => ({ metric: `Page: ${p._id}`, value: `${p.views} views` })),
    ]
    await exportToExcel({ title: "Analytics Report", sheetName: "Analytics", filename: "VCHUKI_Analytics", columns: [{ header: "Metric", key: "metric", width: 35 }, { header: "Value", key: "value", width: 20 }], data: exportData })
  }

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading analytics...</div>

  const deviceMap: Record<string, number> = {}
  tracking?.deviceBreakdown?.forEach((d: any) => { deviceMap[d._id] = d.count })
  const totalDevices = Object.values(deviceMap).reduce((s: number, v) => s + (v as number), 0) || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Analytics</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real visitor tracking & business metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="text-[10px] border border-border bg-background px-2 py-1.5 text-foreground">
            <option value={1}>Today</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            <Download className="h-3 w-3" /> Export
          </button>
        </div>
      </div>

      {/* Traffic KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPI icon={Eye} label="Page Views" value={tracking?.totalViews || 0} sub={`${tracking?.todayViews || 0} today`} />
        <KPI icon={Users} label="Unique Visitors" value={tracking?.uniqueSessions || 0} />
        <KPI icon={IndianRupee} label="Revenue" value={`₹${(stats?.revenue || 0).toLocaleString()}`} />
        <KPI icon={ShoppingCart} label="Orders" value={stats?.totalOrders || 0} />
        <KPI icon={Package} label="Products" value={stats?.totalProducts || 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Pages */}
        <div className="p-4 border border-border bg-card">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-[#c4956a]" /> Top Pages</h3>
          {tracking?.pageBreakdown?.length > 0 ? (
            <div className="space-y-2">
              {tracking.pageBreakdown.slice(0, 10).map((page: any, i: number) => {
                const maxViews = tracking.pageBreakdown[0]?.views || 1
                const barWidth = (page.views / maxViews) * 100
                return (
                  <div key={page._id} className="group">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] text-muted-foreground w-4">{i + 1}.</span>
                        <span className="text-xs text-foreground truncate">{page._id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {page.uniqueVisitors > 0 && <span className="text-[9px] text-muted-foreground">{page.uniqueVisitors} unique</span>}
                        {page.avgDuration > 0 && <span className="text-[9px] text-muted-foreground">{Math.round(page.avgDuration)}s avg</span>}
                        <span className="text-xs font-medium text-foreground">{page.views}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[#c4956a]/60 rounded-full transition-all" style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No page views recorded yet</p>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="p-4 border border-border bg-card">
          <h3 className="text-sm font-medium text-foreground mb-4">Device Breakdown</h3>
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="p-3 border border-border">
              <Smartphone className="h-4 w-4 mx-auto text-[#c4956a]" />
              <p className="text-lg font-light text-foreground mt-1">{Math.round(((deviceMap.mobile || 0) / totalDevices) * 100)}%</p>
              <p className="text-[9px] text-muted-foreground">Mobile ({deviceMap.mobile || 0})</p>
            </div>
            <div className="p-3 border border-border">
              <Monitor className="h-4 w-4 mx-auto text-blue-500" />
              <p className="text-lg font-light text-foreground mt-1">{Math.round(((deviceMap.desktop || 0) / totalDevices) * 100)}%</p>
              <p className="text-[9px] text-muted-foreground">Desktop ({deviceMap.desktop || 0})</p>
            </div>
            <div className="p-3 border border-border">
              <Tablet className="h-4 w-4 mx-auto text-emerald-500" />
              <p className="text-lg font-light text-foreground mt-1">{Math.round(((deviceMap.tablet || 0) / totalDevices) * 100)}%</p>
              <p className="text-[9px] text-muted-foreground">Tablet ({deviceMap.tablet || 0})</p>
            </div>
          </div>
        </div>

        {/* Top Referrers */}
        <div className="p-4 border border-border bg-card">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-blue-500" /> Traffic Sources</h3>
          {tracking?.topReferrers?.length > 0 ? (
            <div className="space-y-2">
              {tracking.topReferrers.map((ref: any) => (
                <div key={ref._id} className="flex items-center justify-between">
                  <span className="text-xs text-foreground truncate max-w-[200px]">{ref._id || "Direct"}</span>
                  <span className="text-xs font-medium text-foreground">{ref.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No referrer data yet</p>
          )}
        </div>

        {/* Live Activity */}
        <div className="p-4 border border-border bg-card">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-emerald-500" /> Recent Activity</h3>
          {tracking?.recentViews?.length > 0 ? (
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {tracking.recentViews.map((view: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    {view.device === "mobile" ? <Smartphone className="h-2.5 w-2.5 text-muted-foreground" /> : <Monitor className="h-2.5 w-2.5 text-muted-foreground" />}
                    <span className="text-foreground truncate max-w-[150px]">{view.path}</span>
                  </div>
                  <span className="text-muted-foreground">{new Date(view.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No activity yet</p>
          )}
        </div>
      </div>

      {/* Hourly Chart (text-based) */}
      {tracking?.hourlyBreakdown?.length > 0 && (
        <div className="p-4 border border-border bg-card">
          <h3 className="text-sm font-medium text-foreground mb-4">Today&apos;s Traffic (Hourly)</h3>
          <div className="flex items-end gap-1 h-24">
            {Array.from({ length: 24 }, (_, h) => {
              const data = tracking.hourlyBreakdown.find((d: any) => d._id === h)
              const count = data?.count || 0
              const max = Math.max(...tracking.hourlyBreakdown.map((d: any) => d.count), 1)
              const height = (count / max) * 100
              return (
                <div key={h} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full bg-[#c4956a]/20 rounded-t relative" style={{ height: `${Math.max(height, 2)}%` }}>
                    <div className="absolute inset-0 bg-[#c4956a]/60 rounded-t" style={{ height: `${height}%` }} />
                  </div>
                  {h % 4 === 0 && <span className="text-[7px] text-muted-foreground">{h}h</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Store Metrics */}
      <div className="p-4 border border-border bg-card">
        <h3 className="text-sm font-medium text-foreground mb-3">Store Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex justify-between p-2 border border-border"><span className="text-muted-foreground">AOV</span><span className="font-medium text-foreground">{aov > 0 ? `₹${aov}` : "—"}</span></div>
          <div className="flex justify-between p-2 border border-border"><span className="text-muted-foreground">Conversion</span><span className="font-medium text-foreground">{tracking?.uniqueSessions > 0 ? `${((stats?.totalOrders || 0) / tracking.uniqueSessions * 100).toFixed(1)}%` : "—"}</span></div>
          <div className="flex justify-between p-2 border border-border"><span className="text-muted-foreground">Pages/Session</span><span className="font-medium text-foreground">{tracking?.uniqueSessions > 0 ? (tracking.totalViews / tracking.uniqueSessions).toFixed(1) : "—"}</span></div>
          <div className="flex justify-between p-2 border border-border"><span className="text-muted-foreground">Registered Users</span><span className="font-medium text-foreground">{stats?.totalUsers || 0}</span></div>
        </div>
      </div>
    </div>
  )
}

function KPI({ icon: Icon, label, value, sub }: { icon: any; label: string; value: any; sub?: string }) {
  return (
    <div className="p-4 border border-border bg-card">
      <div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span></div>
      <p className="text-xl font-light text-foreground mt-2">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}
