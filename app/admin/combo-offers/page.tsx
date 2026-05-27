"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Zap, ToggleLeft, ToggleRight } from "lucide-react"

interface ComboOffer {
  _id: string
  title: string
  description: string
  discount: number
  categories: string[]
  sizeGroup: string
  minQty: number
  isActive: boolean
  validTo: string
}

const CATEGORY_OPTIONS = [
  { value: "full-sleeve-shirt", label: "Full Sleeve Shirt" },
  { value: "half-sleeve-shirt", label: "Half Sleeve Shirt" },
  { value: "full-sleeve-kurta", label: "Full Sleeve Kurta" },
  { value: "half-sleeve-kurta", label: "Half Sleeve Kurta" },
  { value: "linen", label: "Linen" },
  { value: "kurta-full-sleeve", label: "Kurta Full Sleeve" },
  { value: "kurta-half-sleeve", label: "Kurta Half Sleeve" },
]

export default function AdminComboOffersPage() {
  const [offers, setOffers] = useState<ComboOffer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedCats, setSelectedCats] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/combo-offers")
      .then((r) => r.json())
      .then((d) => { setOffers(d.offers || []); setLoading(false) })
  }, [])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await fetch("/api/combo-offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        description: fd.get("description"),
        discount: Number(fd.get("discount")),
        categories: selectedCats,
        sizeGroup: fd.get("sizeGroup"),
        minQty: Number(fd.get("minQty")) || 2,
        validTo: new Date(fd.get("validTo") as string),
        isActive: true,
      }),
    })
    if (res.ok) {
      const offer = await res.json()
      setOffers([offer, ...offers])
      setShowForm(false)
      setSelectedCats([])
    }
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/combo-offers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    })
    if (res.ok) {
      setOffers(offers.map((o) => (o._id === id ? { ...o, isActive: !current } : o)))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this combo offer?")) return
    await fetch(`/api/combo-offers/${id}`, { method: "DELETE" })
    setOffers(offers.filter((o) => o._id !== id))
  }

  function toggleCategory(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#c4956a]" /> Combo Offers
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {offers.filter((o) => o.isActive).length} active offers
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="text-xs h-8">
          <Plus className="h-3.5 w-3.5 mr-1" /> Create Offer
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 border bg-card space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">Title</label>
              <Input name="title" required className="h-8 text-xs mt-1" placeholder="3× Full Sleeve Shirts" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Discount %</label>
              <Input name="discount" type="number" required className="h-8 text-xs mt-1" placeholder="15" />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] text-muted-foreground">Description (shown to customer)</label>
              <Input name="description" required className="h-8 text-xs mt-1" placeholder="Buy 3 Full Sleeve Shirts & save 15%" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Size Group</label>
              <select name="sizeGroup" className="w-full h-8 mt-1 border bg-background px-2 text-xs">
                <option value="all">All Sizes</option>
                <option value="S/M/L">S / M / L</option>
                <option value="XL/XXL">XL / XXL</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Min Qty in Cart</label>
              <Input name="minQty" type="number" defaultValue="3" className="h-8 text-xs mt-1" />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] text-muted-foreground mb-1 block">Applicable Categories</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleCategory(cat.value)}
                    className={`px-2.5 py-1 text-[10px] border transition-all ${
                      selectedCats.includes(cat.value)
                        ? "border-[#c4956a] bg-[#c4956a]/10 text-[#c4956a] font-medium"
                        : "border-border text-muted-foreground hover:border-[#c4956a]/30"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Valid Until</label>
              <Input name="validTo" type="date" required className="h-8 text-xs mt-1" />
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm" className="text-xs h-7">
                Create Offer
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Offers List */}
      <div className="space-y-2">
        {offers.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border">
            <Zap className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No combo offers yet</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Create your first offer to boost sales</p>
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer._id}
              className={`p-4 border transition-all ${
                offer.isActive ? "border-[#c4956a]/30 bg-[#c4956a]/5" : "border-border opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{offer.title}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#c4956a]/10 text-[#c4956a] font-bold">
                      {offer.discount}% OFF
                    </span>
                    {!offer.isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground">PAUSED</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{offer.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>Size: {offer.sizeGroup}</span>
                    <span>Min Qty: {offer.minQty}</span>
                    <span>Categories: {offer.categories.join(", ")}</span>
                    <span>Expires: {new Date(offer.validTo).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(offer._id, offer.isActive)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title={offer.isActive ? "Pause" : "Activate"}
                  >
                    {offer.isActive ? (
                      <ToggleRight className="h-5 w-5 text-[#c4956a]" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(offer._id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
