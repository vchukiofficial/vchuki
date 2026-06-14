"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Save, Trash2, Plus, X, Star, Eye } from "lucide-react"
import Link from "next/link"

interface Variant {
  _id: string
  color: { name: string; hex: string }
  size: string
  stock: number
  fabric: string
  fit: string
  priceAdjustment: number
  sku: string
  images: string[]
}

interface Product {
  _id: string
  name: string
  slug: string
  description: string
  basePrice: number
  category: string
  tags: string[]
  images: string[]
  isFeatured: boolean
  isActive: boolean
  rating: number
  reviewCount: number
  createdAt: string
}

export default function AdminProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    async function fetch_data() {
      const [pRes, vRes] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch(`/api/products/${id}/variants`),
      ])
      if (pRes.ok) {
        const pData = await pRes.json()
        setProduct(pData.product || pData)
      }
      if (vRes.ok) {
        const vData = await vRes.json()
        setVariants(vData.variants || vData || [])
      }
      setLoading(false)
    }
    fetch_data()
  }, [id])

  async function handleSave() {
    if (!product) return
    setSaving(true)
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        comparePrice: (product as any).comparePrice || 0,
        category: product.category,
        tags: product.tags,
        images: product.images,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
      }),
    })
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm("Delete this product and all its variants? This cannot be undone.")) return
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    router.push("/admin/products")
  }

  async function deleteVariant(variantId: string) {
    if (!confirm("Delete this variant?")) return
    await fetch(`/api/products/${id}/variants/${variantId}`, { method: "DELETE" })
    setVariants(variants.filter(v => v._id !== variantId))
  }

  function updateField(field: string, value: any) {
    setProduct(prev => prev ? { ...prev, [field]: value } : prev)
  }

  function addImage() {
    const url = prompt("Enter image URL:")
    if (url && product) {
      setProduct({ ...product, images: [...product.images, url] })
    }
  }

  function removeImage(idx: number) {
    if (!product) return
    setProduct({ ...product, images: product.images.filter((_, i) => i !== idx) })
  }

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading product...</div>
  if (!product) return <div className="text-sm text-red-500 p-4">Product not found</div>

  // Group variants by color
  const colorGroups: Record<string, Variant[]> = {}
  variants.forEach(v => {
    const key = v.color?.name || "Default"
    if (!colorGroups[key]) colorGroups[key] = []
    colorGroups[key].push(v)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="h-8 w-8 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg font-medium tracking-tight text-foreground">{product.name}</h1>
            <p className="text-[10px] text-muted-foreground font-mono">{product.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/product/${product.slug}`} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            <Eye className="h-3 w-3" /> Preview
          </Link>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
            <Save className="h-3 w-3" /> {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 text-red-500 text-[10px] font-medium hover:bg-red-500/5 transition-colors">
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
        {/* Left — Images */}
        <div className="space-y-3">
          {/* Main Image */}
          <div className="relative aspect-[3/4] border border-border bg-card overflow-hidden">
            {product.images?.[activeImage] ? (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="400px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">No Image</div>
            )}
            <span className="absolute top-2 left-2 text-[9px] bg-background/80 backdrop-blur-sm border border-border px-2 py-0.5 text-muted-foreground">
              {activeImage + 1} / {product.images?.length || 0}
            </span>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-20 flex-shrink-0 border overflow-hidden ${activeImage === i ? "border-[#c4956a]" : "border-border"}`}
              >
                <Image src={img} alt="" fill className="object-contain p-1" sizes="64px" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                  className="absolute top-0.5 right-0.5 h-4 w-4 bg-red-500 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </button>
            ))}
            <button onClick={addImage} className="w-16 h-20 flex-shrink-0 border border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-[#c4956a]/40 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Info */}
          <div className="p-3 border border-border bg-card space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={product.isActive ? "text-emerald-600" : "text-red-500"}>{product.isActive ? "Active" : "Inactive"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Featured</span><span>{product.isFeatured ? "Yes" : "No"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span>{product.rating} ★ ({product.reviewCount})</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Variants</span><span>{variants.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(product.createdAt).toLocaleDateString("en-IN")}</span></div>
          </div>
        </div>

        {/* Right — Edit Form */}
        <div className="space-y-5">
          {/* Basic Info */}
          <div className="p-4 border border-border bg-card space-y-3">
            <h3 className="text-sm font-medium text-foreground">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Name</label>
                <input value={product.name} onChange={e => updateField("name", e.target.value)} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Description</label>
                <textarea value={product.description} onChange={e => updateField("description", e.target.value)} rows={4} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50 resize-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Price (₹)</label>
                <input type="number" value={product.basePrice} onChange={e => updateField("basePrice", Number(e.target.value))} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">MRP / Compare Price (₹)</label>
                <input type="number" value={(product as any).comparePrice || ""} onChange={e => updateField("comparePrice", Number(e.target.value) || 0)} placeholder="Original MRP for strikethrough" className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Category</label>
                <select value={product.category} onChange={e => updateField("category", e.target.value)} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50">
                  <option value="linen-full-sleeve">Linen Full Sleeve</option>
                  <option value="linen-half-sleeve">Linen Half Sleeve</option>
                  <option value="kurta-full-sleeve">Short Kurta Full Sleeve</option>
                  <option value="kurta-half-sleeve">Short Kurta Half Sleeve</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Tags (comma separated)</label>
                <input value={product.tags?.join(", ")} onChange={e => updateField("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input type="checkbox" checked={product.isActive} onChange={e => updateField("isActive", e.target.checked)} className="accent-[#c4956a]" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input type="checkbox" checked={product.isFeatured} onChange={e => updateField("isFeatured", e.target.checked)} className="accent-[#c4956a]" />
                  <Star className="h-3 w-3" /> Featured
                </label>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="p-4 border border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Variants ({variants.length})</h3>
              <span className="text-[10px] text-muted-foreground">{Object.keys(colorGroups).length} colors × sizes</span>
            </div>

            {Object.entries(colorGroups).map(([colorName, colorVariants]) => (
              <div key={colorName} className="border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: colorVariants[0]?.color?.hex }} />
                  <span className="text-xs font-medium text-foreground">{colorName}</span>
                  <span className="text-[9px] text-muted-foreground ml-auto">{colorVariants[0]?.fabric}</span>
                </div>
                {/* Variant image preview */}
                {colorVariants[0]?.images?.[0] && (
                  <div className="relative w-12 h-16 border border-border overflow-hidden mb-2">
                    <Image src={colorVariants[0].images[0]} alt={colorName} fill className="object-contain" sizes="48px" />
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {colorVariants.sort((a, b) => ["S","M","L","XL","XXL"].indexOf(a.size) - ["S","M","L","XL","XXL"].indexOf(b.size)).map(v => (
                    <div key={v._id} className="flex items-center gap-1 px-2 py-1 border border-border text-[10px]">
                      <span className="font-medium text-foreground">{v.size}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className={v.stock > 0 ? "text-emerald-600" : "text-red-500"}>{v.stock}</span>
                      {v.priceAdjustment > 0 && <span className="text-[#c4956a]">+₹{v.priceAdjustment}</span>}
                      <button onClick={() => deleteVariant(v._id)} className="ml-1 text-muted-foreground hover:text-red-500">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground mt-1.5 font-mono">{colorVariants[0]?.sku?.replace(/-[SMLX]+$/, "-*")}</p>
              </div>
            ))}

            {variants.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-xs">No variants created for this product.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
