"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Save, Trash2, Plus, X, Star, Eye, Upload, ImagePlus, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

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
  comparePrice?: number
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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "product" | "variant"; variantId?: string }>({ open: false, type: "product" })
  const [uploading, setUploading] = useState(false)
  const [editingVariant, setEditingVariant] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
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
    fetchData()
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
        comparePrice: product.comparePrice || 0,
        category: product.category,
        tags: product.tags,
        images: product.images,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
      }),
    })
    setSaving(false)
  }

  async function confirmDelete() {
    if (deleteDialog.type === "product") {
      await fetch(`/api/products/${id}`, { method: "DELETE" })
      router.push("/admin/products")
    } else if (deleteDialog.variantId) {
      await fetch(`/api/products/${id}/variants/${deleteDialog.variantId}`, { method: "DELETE" })
      setVariants(variants.filter(v => v._id !== deleteDialog.variantId))
    }
    setDeleteDialog({ open: false, type: "product" })
  }

  function updateField(field: string, value: any) {
    setProduct(prev => prev ? { ...prev, [field]: value } : prev)
  }

  // Upload image to Vercel Blob
  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    if (res.ok) {
      const data = await res.json()
      return data.url
    }
    return null
  }

  // Handle product image upload
  async function handleProductImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !product) return
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(e.target.files)) {
      const url = await uploadImage(file)
      if (url) urls.push(url)
    }
    setProduct({ ...product, images: [...product.images, ...urls] })
    setUploading(false)
    e.target.value = ""
  }

  // Handle variant image upload
  async function handleVariantImageUpload(variantId: string, e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(e.target.files)) {
      const url = await uploadImage(file)
      if (url) urls.push(url)
    }

    // Update variant images in DB
    const variant = variants.find(v => v._id === variantId)
    if (variant) {
      const newImages = [...(variant.images || []), ...urls]
      await fetch(`/api/products/${id}/variants/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: newImages }),
      })
      setVariants(variants.map(v => v._id === variantId ? { ...v, images: newImages } : v))
    }
    setUploading(false)
    e.target.value = ""
  }

  // Remove variant image
  async function removeVariantImage(variantId: string, imgIdx: number) {
    const variant = variants.find(v => v._id === variantId)
    if (!variant) return
    const newImages = variant.images.filter((_, i) => i !== imgIdx)
    await fetch(`/api/products/${id}/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: newImages }),
    })
    setVariants(variants.map(v => v._id === variantId ? { ...v, images: newImages } : v))
  }

  // Reorder variant images
  async function moveVariantImage(variantId: string, idx: number, direction: -1 | 1) {
    const variant = variants.find(v => v._id === variantId)
    if (!variant) return
    const target = idx + direction
    if (target < 0 || target >= variant.images.length) return
    const newImages = [...variant.images]
    ;[newImages[idx], newImages[target]] = [newImages[target], newImages[idx]]
    await fetch(`/api/products/${id}/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: newImages }),
    })
    setVariants(variants.map(v => v._id === variantId ? { ...v, images: newImages } : v))
  }

  // Update variant stock
  async function updateVariantStock(variantId: string, stock: number) {
    await fetch(`/api/products/${id}/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock }),
    })
    setVariants(variants.map(v => v._id === variantId ? { ...v, stock } : v))
  }

  // Add product image via URL
  function addImageUrl() {
    const url = prompt("Enter image URL:")
    if (url && product) {
      setProduct({ ...product, images: [...product.images, url] })
    }
  }

  function removeProductImage(idx: number) {
    if (!product) return
    setProduct({ ...product, images: product.images.filter((_, i) => i !== idx) })
  }

  // Reorder product images — images[0] is used as the cover photo everywhere on the site
  function moveProductImage(idx: number, direction: -1 | 1) {
    if (!product) return
    const target = idx + direction
    if (target < 0 || target >= product.images.length) return
    const newImages = [...product.images]
    ;[newImages[idx], newImages[target]] = [newImages[target], newImages[idx]]
    setProduct({ ...product, images: newImages })
    if (activeImage === idx) setActiveImage(target)
    else if (activeImage === target) setActiveImage(idx)
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
          <Link href={`/product/${product.slug}`} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
            <Eye className="h-3 w-3" /> Preview
          </Link>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
            <Save className="h-3 w-3" /> {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => setDeleteDialog({ open: true, type: "product" })} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 text-red-500 text-[10px] font-medium hover:bg-red-500/5">
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
        {/* Left — Product Images */}
        <div className="space-y-3">
          <div className="relative aspect-[3/4] border border-border bg-card overflow-hidden">
            {product.images?.[activeImage] ? (
              product.images[activeImage].match(/\.(mp4|webm|mov)$/i) ? (
                <video src={product.images[activeImage]} controls className="absolute inset-0 w-full h-full object-contain p-4" />
              ) : (
                <Image src={product.images[activeImage]} alt={product.name} fill className="object-contain p-4" sizes="400px" />
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">No Media</div>
            )}
            <span className="absolute top-2 left-2 text-[9px] bg-background/80 backdrop-blur-sm border border-border px-2 py-0.5 text-muted-foreground">
              {activeImage + 1} / {product.images?.length || 0}
            </span>
          </div>

          {/* Thumbnails + Upload */}
          <p className="text-[9px] text-muted-foreground">Drag order with the arrows — the first photo is used as the cover image across the whole site.</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {product.images?.map((img, i) => (
              <div key={i} className={`relative w-16 h-20 flex-shrink-0 border overflow-hidden group ${activeImage === i ? "border-[#c4956a]" : "border-border"}`}>
                <button onClick={() => setActiveImage(i)} className="absolute inset-0 w-full h-full">
                  {img.match(/\.(mp4|webm|mov)$/i) ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted"><span className="text-[9px] text-muted-foreground font-bold">▶ VID</span></div>
                  ) : (
                    <Image src={img} alt="" fill className="object-contain p-1" sizes="64px" />
                  )}
                </button>
                {i === 0 && (
                  <span className="absolute top-0.5 left-0.5 text-[7px] uppercase tracking-wide bg-[#c4956a] text-white px-1 py-0.5 pointer-events-none">Cover</span>
                )}
                <button onClick={(e) => { e.stopPropagation(); removeProductImage(i) }} className="absolute top-0.5 right-0.5 h-4 w-4 bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-2.5 w-2.5" />
                </button>
                <div className="absolute bottom-0.5 inset-x-0.5 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveProductImage(i, -1) }}
                    disabled={i === 0}
                    className="h-4 w-4 bg-black/70 text-white flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronLeft className="h-2.5 w-2.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveProductImage(i, 1) }}
                    disabled={i === (product.images?.length ?? 0) - 1}
                    className="h-4 w-4 bg-black/70 text-white flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronRight className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            ))}
            {/* Upload button */}
            <label className="w-16 h-20 flex-shrink-0 border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-[#c4956a]/40 cursor-pointer transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span className="text-[8px] mt-0.5">Upload</span>
              <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleProductImageUpload} />
            </label>
            <button onClick={addImageUrl} className="w-16 h-20 flex-shrink-0 border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-[#c4956a]/40 transition-colors">
              <Plus className="h-3.5 w-3.5" />
              <span className="text-[8px] mt-0.5">URL</span>
            </button>
          </div>

          {uploading && <p className="text-[10px] text-[#c4956a] animate-pulse">Uploading images...</p>}

          {/* Quick Info */}
          <div className="p-3 border border-border bg-card space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={product.isActive ? "text-emerald-600" : "text-red-500"}>{product.isActive ? "Active" : "Inactive"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Featured</span><span>{product.isFeatured ? "Yes" : "No"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span>{product.rating} ★ ({product.reviewCount})</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Variants</span><span>{variants.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Colors</span><span>{Object.keys(colorGroups).length}</span></div>
          </div>
        </div>

        {/* Right — Edit Form + Variants */}
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
                <textarea value={product.description} onChange={e => updateField("description", e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50 resize-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Selling Price (₹)</label>
                <input type="number" value={product.basePrice} onChange={e => updateField("basePrice", Number(e.target.value))} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">MRP (₹)</label>
                <input type="number" value={product.comparePrice || ""} onChange={e => updateField("comparePrice", Number(e.target.value) || 0)} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
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
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Tags</label>
                <input value={product.tags?.join(", ")} onChange={e => updateField("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input type="checkbox" checked={product.isActive} onChange={e => updateField("isActive", e.target.checked)} className="accent-[#c4956a]" /> Active
                </label>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input type="checkbox" checked={product.isFeatured} onChange={e => updateField("isFeatured", e.target.checked)} className="accent-[#c4956a]" />
                  <Star className="h-3 w-3" /> Featured
                </label>
              </div>
            </div>
          </div>

          {/* Variants with Image Management */}
          <div className="p-4 border border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Variants & Images ({variants.length})</h3>
              <span className="text-[10px] text-muted-foreground">{Object.keys(colorGroups).length} colors · Click variant to manage images</span>
            </div>

            {Object.entries(colorGroups).map(([colorName, colorVariants]) => {
              const isEditing = editingVariant === colorName
              const variantImages = colorVariants[0]?.images || []

              return (
                <div key={colorName} className={`border p-3 transition-colors ${isEditing ? "border-[#c4956a]/50 bg-[#c4956a]/5" : "border-border"}`}>
                  {/* Color Header */}
                  <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setEditingVariant(isEditing ? null : colorName)}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: colorVariants[0]?.color?.hex }} />
                      <span className="text-xs font-medium text-foreground">{colorName}</span>
                      <span className="text-[9px] text-muted-foreground">{colorVariants.length} sizes · {variantImages.length} images</span>
                    </div>
                    <span className="text-[9px] text-[#c4956a]">{isEditing ? "▲ Close" : "▼ Edit Images"}</span>
                  </div>

                  {/* Variant Images — Expanded */}
                  {isEditing && (
                    <div className="mt-3 pt-3 border-t border-border space-y-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1"><ImagePlus className="h-3 w-3" /> Product Angles & Photos</p>

                      {/* Image grid */}
                      <div className="flex gap-2 flex-wrap">
                        {variantImages.map((img, i) => (
                          <div key={i} className="relative w-20 h-24 border border-border overflow-hidden group">
                            <Image src={img} alt={`${colorName} angle ${i + 1}`} fill className="object-cover" sizes="80px" />
                            <button onClick={() => removeVariantImage(colorVariants[0]._id, i)} className="absolute top-0.5 right-0.5 h-4 w-4 bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-2.5 w-2.5" />
                            </button>
                            <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1">{i + 1}</span>
                            <div className="absolute bottom-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => moveVariantImage(colorVariants[0]._id, i, -1)}
                                disabled={i === 0}
                                className="h-4 w-4 bg-black/70 text-white flex items-center justify-center disabled:opacity-30"
                              >
                                <ChevronLeft className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={() => moveVariantImage(colorVariants[0]._id, i, 1)}
                                disabled={i === variantImages.length - 1}
                                className="h-4 w-4 bg-black/70 text-white flex items-center justify-center disabled:opacity-30"
                              >
                                <ChevronRight className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Upload more images for this variant */}
                        <label className="w-20 h-24 border border-dashed border-[#c4956a]/40 flex flex-col items-center justify-center text-[#c4956a] cursor-pointer hover:bg-[#c4956a]/5 transition-colors">
                          <Upload className="h-4 w-4" />
                          <span className="text-[8px] mt-1">Add Photos</span>
                          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => handleVariantImageUpload(colorVariants[0]._id, e)} />
                        </label>
                      </div>
                      <p className="text-[9px] text-muted-foreground">Upload multiple angles: front, back, side, close-up, lifestyle shots</p>
                    </div>
                  )}

                  {/* Sizes & Stock */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {colorVariants.sort((a, b) => ["S","M","L","XL","XXL"].indexOf(a.size) - ["S","M","L","XL","XXL"].indexOf(b.size)).map(v => (
                      <div key={v._id} className="flex items-center gap-1 px-2 py-1 border border-border text-[10px]">
                        <span className="font-medium text-foreground">{v.size}</span>
                        <span className="text-muted-foreground">·</span>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={e => updateVariantStock(v._id, Number(e.target.value))}
                          className="w-8 h-4 text-[10px] text-center border-none bg-transparent text-emerald-600 focus:outline-none"
                          min={0}
                        />
                        {v.priceAdjustment > 0 && <span className="text-[#c4956a]">+₹{v.priceAdjustment}</span>}
                        <button onClick={() => setDeleteDialog({ open: true, type: "variant", variantId: v._id })} className="ml-1 text-muted-foreground hover:text-red-500">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {variants.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-xs">No variants. Add from the Products list page.</div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: "product" })}
        onConfirm={confirmDelete}
        title={deleteDialog.type === "product" ? "Delete Product?" : "Delete Variant?"}
        description={deleteDialog.type === "product" ? "This product and all variants will be permanently deleted." : "This size variant will be removed."}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
