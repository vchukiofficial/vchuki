"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch("/api/coupons").then(r => r.json()).then(d => { setCoupons(d.coupons || []); setLoading(false) }) }, [])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: (fd.get("code") as string).toUpperCase(), type: fd.get("type"), value: Number(fd.get("value")), minAmount: Number(fd.get("minAmount")) || undefined, maxValue: Number(fd.get("maxValue")) || undefined, usageLimit: Number(fd.get("usageLimit")) || 100, validFrom: new Date(), validTo: new Date(fd.get("validTo") as string), isActive: true }) })
    if (res.ok) { const c = await res.json(); setCoupons([c, ...coupons]); setShowForm(false) }
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold tracking-tight">Coupons</h1><p className="text-xs text-muted-foreground mt-0.5">{coupons.length} active coupons</p></div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="text-xs h-8"><Plus className="h-3.5 w-3.5 mr-1" /> Create</Button>
      </div>
      {showForm && (
        <form onSubmit={handleCreate} className="p-4 rounded-lg border bg-card grid grid-cols-2 gap-3 animate-fade-in">
          <div><label className="text-[11px] text-muted-foreground">Code</label><Input name="code" required className="h-8 text-xs mt-1" placeholder="LAUNCH20" /></div>
          <div><label className="text-[11px] text-muted-foreground">Type</label><select name="type" className="w-full h-8 mt-1 rounded-md border bg-background px-2 text-xs"><option value="percentage">Percentage</option><option value="flat">Flat</option><option value="free_shipping">Free Shipping</option></select></div>
          <div><label className="text-[11px] text-muted-foreground">Value</label><Input name="value" type="number" required className="h-8 text-xs mt-1" /></div>
          <div><label className="text-[11px] text-muted-foreground">Min Amount</label><Input name="minAmount" type="number" className="h-8 text-xs mt-1" /></div>
          <div><label className="text-[11px] text-muted-foreground">Max Discount</label><Input name="maxValue" type="number" className="h-8 text-xs mt-1" /></div>
          <div><label className="text-[11px] text-muted-foreground">Valid Until</label><Input name="validTo" type="date" required className="h-8 text-xs mt-1" /></div>
          <div><label className="text-[11px] text-muted-foreground">Usage Limit</label><Input name="usageLimit" type="number" defaultValue="100" className="h-8 text-xs mt-1" /></div>
          <div className="flex items-end"><Button type="submit" size="sm" className="text-xs h-7">Create</Button></div>
        </form>
      )}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/50"><tr className="text-left text-muted-foreground"><th className="p-3 font-medium">Code</th><th className="p-3 font-medium">Type</th><th className="p-3 font-medium">Value</th><th className="p-3 font-medium hidden md:table-cell">Min Order</th><th className="p-3 font-medium">Used</th><th className="p-3 font-medium hidden md:table-cell">Expires</th></tr></thead>
          <tbody className="divide-y">
            {coupons.map(c => (
              <tr key={c._id} className="hover:bg-muted/30"><td className="p-3 font-mono font-medium">{c.code}</td><td className="p-3 capitalize">{c.type}</td><td className="p-3">{c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}</td><td className="p-3 text-muted-foreground hidden md:table-cell">{c.minAmount ? `₹${c.minAmount}` : "—"}</td><td className="p-3">{c.usedBy?.length || 0}/{c.usageLimit}</td><td className="p-3 text-muted-foreground hidden md:table-cell">{new Date(c.validTo).toLocaleDateString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
