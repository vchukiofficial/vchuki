"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface Coupon {
  _id: string
  code: string
  type: string
  value: number
  minAmount?: number
  maxValue?: number
  usageLimit: number
  usedBy: string[]
  isActive: boolean
  validTo: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/coupons")
      .then((r) => r.json())
      .then((data) => { setCoupons(data.coupons || []); setLoading(false) })
  }, [])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = {
      code: (fd.get("code") as string).toUpperCase(),
      type: fd.get("type"),
      value: Number(fd.get("value")),
      minAmount: Number(fd.get("minAmount")) || undefined,
      maxValue: Number(fd.get("maxValue")) || undefined,
      usageLimit: Number(fd.get("usageLimit")) || 100,
      validFrom: new Date(),
      validTo: new Date(fd.get("validTo") as string),
      isActive: true,
    }
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const coupon = await res.json()
      setCoupons([coupon, ...coupons])
      setShowForm(false)
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading coupons...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupons ({coupons.length})</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Add Coupon
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 rounded-lg border border-border/50 bg-card/50 mb-6 grid grid-cols-2 gap-3">
          <div><Label>Code</Label><Input name="code" required placeholder="SUMMER25" /></div>
          <div><Label>Type</Label><Input name="type" required placeholder="percentage, flat, free_shipping" /></div>
          <div><Label>Value</Label><Input name="value" type="number" required /></div>
          <div><Label>Min Amount (₹)</Label><Input name="minAmount" type="number" /></div>
          <div><Label>Max Discount (₹)</Label><Input name="maxValue" type="number" /></div>
          <div><Label>Usage Limit</Label><Input name="usageLimit" type="number" defaultValue="100" /></div>
          <div><Label>Valid Until</Label><Input name="validTo" type="date" required /></div>
          <div className="flex items-end">
            <Button type="submit" size="sm">Create</Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/50">
            <tr className="text-left text-muted-foreground">
              <th className="p-3">Code</th>
              <th className="p-3">Type</th>
              <th className="p-3">Value</th>
              <th className="p-3">Min Order</th>
              <th className="p-3">Used</th>
              <th className="p-3">Expires</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="border-t border-border/50">
                <td className="p-3 font-mono font-medium">{coupon.code}</td>
                <td className="p-3 capitalize">{coupon.type}</td>
                <td className="p-3">{coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}</td>
                <td className="p-3 text-muted-foreground">{coupon.minAmount ? `₹${coupon.minAmount}` : "—"}</td>
                <td className="p-3">{coupon.usedBy.length}/{coupon.usageLimit}</td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(coupon.validTo).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${coupon.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
