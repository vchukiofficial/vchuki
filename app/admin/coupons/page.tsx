"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Download } from "lucide-react"
import { exportToExcel } from "@/lib/admin/exportExcel"

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => { fetch("/api/coupons").then(r => r.json()).then(d => { setCoupons(d.coupons || []); setLoading(false) }) }, [])

  function toggleSelect(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function toggleAll() {
    if (selected.size === coupons.length) setSelected(new Set())
    else setSelected(new Set(coupons.map(c => c._id)))
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} coupon(s)?`)) return
    for (const id of selected) {
      await fetch(`/api/coupons/${id}`, { method: "DELETE", credentials: "include" })
    }
    setCoupons(coupons.filter(c => !selected.has(c._id)))
    setSelected(new Set())
  }

  async function singleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return
    await fetch(`/api/coupons/${id}`, { method: "DELETE", credentials: "include" })
    setCoupons(coupons.filter(c => c._id !== id))
  }

  async function handleExport() {
    const exportData = coupons.map(c => ({
      code: c.code,
      type: c.type,
      value: c.type === "percentage" ? `${c.value}%` : `₹${c.value}`,
      minOrder: c.minAmount ? `₹${c.minAmount}` : "—",
      maxDiscount: c.maxValue ? `₹${c.maxValue}` : "—",
      used: `${c.usedBy?.length || 0}/${c.usageLimit}`,
      expires: new Date(c.validTo).toLocaleDateString("en-IN"),
      active: c.isActive ? "Yes" : "No",
    }))
    await exportToExcel({
      title: "Coupons Report",
      sheetName: "Coupons",
      filename: "VCHUKI_Coupons",
      columns: [
        { header: "Code", key: "code", width: 16 },
        { header: "Type", key: "type", width: 14 },
        { header: "Value", key: "value", width: 10 },
        { header: "Min Order", key: "minOrder", width: 12 },
        { header: "Max Discount", key: "maxDiscount", width: 12 },
        { header: "Used", key: "used", width: 10 },
        { header: "Expires", key: "expires", width: 12 },
        { header: "Active", key: "active", width: 8 },
      ],
      data: exportData,
    })
  }

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
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={bulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-red-600 transition-colors">
              <Trash2 className="h-3 w-3" /> Delete ({selected.size})
            </button>
          )}
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            <Download className="h-3 w-3" /> Export Excel
          </button>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="text-xs h-8"><Plus className="h-3.5 w-3.5 mr-1" /> Create</Button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 border bg-card grid grid-cols-2 gap-3 animate-fade-in">
          <div><label className="text-[11px] text-muted-foreground">Code</label><Input name="code" required className="h-8 text-xs mt-1" placeholder="LAUNCH20" /></div>
          <div><label className="text-[11px] text-muted-foreground">Type</label><select name="type" className="w-full h-8 mt-1 border bg-background px-2 text-xs"><option value="percentage">Percentage</option><option value="flat">Flat</option><option value="free_shipping">Free Shipping</option></select></div>
          <div><label className="text-[11px] text-muted-foreground">Value</label><Input name="value" type="number" required className="h-8 text-xs mt-1" /></div>
          <div><label className="text-[11px] text-muted-foreground">Min Amount</label><Input name="minAmount" type="number" className="h-8 text-xs mt-1" /></div>
          <div><label className="text-[11px] text-muted-foreground">Max Discount</label><Input name="maxValue" type="number" className="h-8 text-xs mt-1" /></div>
          <div><label className="text-[11px] text-muted-foreground">Valid Until</label><Input name="validTo" type="date" required className="h-8 text-xs mt-1" /></div>
          <div><label className="text-[11px] text-muted-foreground">Usage Limit</label><Input name="usageLimit" type="number" defaultValue="100" className="h-8 text-xs mt-1" /></div>
          <div className="flex items-end"><Button type="submit" size="sm" className="text-xs h-7">Create</Button></div>
        </form>
      )}

      <div className="border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-card">
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="p-3 w-8"><input type="checkbox" checked={selected.size === coupons.length && coupons.length > 0} onChange={toggleAll} className="accent-[#c4956a]" /></th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Code</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Type</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Value</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider hidden md:table-cell">Min Order</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Used</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider hidden md:table-cell">Expires</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider w-16">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.map(c => (
              <tr key={c._id} className={`transition-colors ${selected.has(c._id) ? "bg-[#c4956a]/5" : "hover:bg-card/50"}`}>
                <td className="p-3"><input type="checkbox" checked={selected.has(c._id)} onChange={() => toggleSelect(c._id)} className="accent-[#c4956a]" /></td>
                <td className="p-3 font-mono font-medium text-foreground">{c.code}</td>
                <td className="p-3 capitalize text-foreground">{c.type}</td>
                <td className="p-3 text-foreground">{c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{c.minAmount ? `₹${c.minAmount}` : "—"}</td>
                <td className="p-3 text-foreground">{c.usedBy?.length || 0}/{c.usageLimit}</td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{new Date(c.validTo).toLocaleDateString()}</td>
                <td className="p-3">
                  <button onClick={() => singleDelete(c._id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
