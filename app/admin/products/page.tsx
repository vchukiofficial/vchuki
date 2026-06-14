"use client"

import { useEffect, useState } from "react"
import { useAdminStore } from "@/store/adminStore"
import { StatusBadge, FileUpload, SectionHeader, EmptyState } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Star, Search, Package, X, Palette, Image as ImageIcon, Download } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { exportToExcel } from "@/lib/admin/exportExcel"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

const PRESET_COLORS = [
  { name: "Desert Sand", hex: "#D4A574" },
  { name: "Royal Indigo", hex: "#3D5A80" },
  { name: "Sage", hex: "#6B7C5E" },
  { name: "Rust Earth", hex: "#8B4513" },
  { name: "Ivory Cream", hex: "#F5E6D3" },
  { name: "Midnight Black", hex: "#1A1A1A" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Ocean Blue", hex: "#4A90D9" },
  { name: "Olive", hex: "#556B2F" },
  { name: "Heritage Gold", hex: "#C4956A" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Maroon", hex: "#800000" },
  { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Dusty Rose", hex: "#DCAE96" },
]

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]

interface VariantRow {
  color: string
  hex: string
  sizes: { size: string; stock: number }[]
  images: string[]
}

export default function AdminProductsPage() {
  const { products, loading, fetchProducts, deleteProduct, updateProduct, createProduct } = useAdminStore()
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formImages, setFormImages] = useState<string[]>([])
  const [mainImage, setMainImage] = useState("")
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "single" | "bulk"; id?: string }>({ open: false, type: "single" })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchProducts() }, [fetchProducts])

  function toggleSelect(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function toggleAll() {
    const ids = filtered.slice(0, 40).map(p => p._id)
    if (selected.size === ids.length) setSelected(new Set())
    else setSelected(new Set(ids))
  }

  async function bulkDelete() {
    setDeleteDialog({ open: true, type: "bulk" })
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      if (deleteDialog.type === "bulk") {
        for (const id of selected) {
          await deleteProduct(id)
        }
        setSelected(new Set())
      } else if (deleteDialog.id) {
        await deleteProduct(deleteDialog.id)
      }
    } finally {
      setDeleting(false)
      setDeleteDialog({ open: false, type: "single" })
    }
  }

  function addVariant() {
    setVariants([...variants, { color: "", hex: "#000000", sizes: ALL_SIZES.slice(1, 6).map(s => ({ size: s, stock: 50 })), images: [] }])
  }

  function removeVariant(i: number) {
    setVariants(variants.filter((_, idx) => idx !== i))
  }

  function updateVariantColor(i: number, color: string, hex: string) {
    const nv = [...variants]
    nv[i].color = color
    nv[i].hex = hex
    setVariants(nv)
  }

  function updateVariantStock(variantIdx: number, sizeIdx: number, stock: number) {
    const nv = [...variants]
    nv[variantIdx].sizes[sizeIdx].stock = stock
    setVariants(nv)
  }

  function toggleVariantSize(variantIdx: number, size: string) {
    const nv = [...variants]
    const existing = nv[variantIdx].sizes.findIndex(s => s.size === size)
    if (existing >= 0) {
      nv[variantIdx].sizes.splice(existing, 1)
    } else {
      nv[variantIdx].sizes.push({ size, stock: 50 })
      nv[variantIdx].sizes.sort((a, b) => ALL_SIZES.indexOf(a.size) - ALL_SIZES.indexOf(b.size))
    }
    setVariants(nv)
  }

  function selectPresetColor(i: number, preset: typeof PRESET_COLORS[0]) {
    const nv = [...variants]
    nv[i].color = preset.name
    nv[i].hex = preset.hex
    setVariants(nv)
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = fd.get("name") as string

    // Build images array: main image first, then sub images
    const allImages: string[] = []
    if (mainImage) allImages.push(mainImage)
    if (formImages.length > 0) allImages.push(...formImages)
    const urlImages = (fd.get("imageUrl") as string || "").split(",").map(t => t.trim()).filter(Boolean)
    if (urlImages.length > 0) allImages.push(...urlImages)

    const product = await createProduct({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now(),
      description: fd.get("description"),
      basePrice: Number(fd.get("basePrice")),
      category: fd.get("category"),
      tags: (fd.get("tags") as string || "").split(",").map(t => t.trim()).filter(Boolean),
      images: allImages,
      isFeatured: fd.get("isFeatured") === "on",
      isActive: true,
    })

    // Create variants via API
    if (product && variants.length > 0) {
      for (const variant of variants) {
        for (const sizeData of variant.sizes) {
          await fetch("/api/products/" + product._id + "/variants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product: product._id,
              color: { name: variant.color, hex: variant.hex },
              size: sizeData.size,
              stock: sizeData.stock,
              fabric: fd.get("fabric") || "Premium Linen",
              fit: fd.get("fit") || "regular",
              priceAdjustment: sizeData.size === "XXL" ? 50 : sizeData.size === "3XL" ? 100 : 0,
              sku: `VC-${product.slug}-${variant.color.toLowerCase().replace(/\s/g, "-")}-${sizeData.size}`,
              images: variant.images.length > 0 ? variant.images : allImages,
            }),
          })
        }
      }
    }

    if (product) {
      setShowForm(false)
      setFormImages([])
      setMainImage("")
      setVariants([])
    }
  }

  async function handleExport() {
    const exportData = filtered.map(p => ({
      name: p.name,
      price: `₹${p.basePrice?.toLocaleString()}`,
      category: p.category,
      tags: p.tags?.join(", ") || "",
      featured: p.isFeatured ? "Yes" : "No",
      active: p.isActive ? "Yes" : "No",
      slug: p.slug,
    }))
    await exportToExcel({
      title: "Products Catalog",
      sheetName: "Products",
      filename: "VCHUKI_Products",
      columns: [
        { header: "Product Name", key: "name", width: 30 },
        { header: "Price", key: "price", width: 12 },
        { header: "Category", key: "category", width: 14 },
        { header: "Tags", key: "tags", width: 25 },
        { header: "Featured", key: "featured", width: 10 },
        { header: "Active", key: "active", width: 10 },
        { header: "Slug", key: "slug", width: 30 },
      ],
      data: exportData,
    })
  }

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))

  if (loading.products) return <div className="text-sm text-muted-foreground animate-pulse">Loading products...</div>

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Products"
        description={`${products.length} products in catalog`}
        action={
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <button onClick={bulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-red-600 transition-colors h-8">
                <Trash2 className="h-3 w-3" /> Delete ({selected.size})
              </button>
            )}
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium uppercase tracking-wider hover:border-[#c4956a]/30 transition-colors text-foreground h-8">
              <Download className="h-3 w-3" /> Export Excel
            </button>
            <Button size="sm" onClick={() => setShowForm(!showForm)} className="text-xs h-8 gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Product
            </Button>
          </div>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="p-5 border border-border bg-card space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">New Product</h3>
            <button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>

          {/* Basic Info */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-3">Basic Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Product Name *</label>
                <Input name="name" required className="h-9 text-xs mt-1" placeholder="Desert Sand Linen Shirt" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Description *</label>
                <textarea name="description" required className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs resize-none h-20 focus:outline-none focus:border-[#c4956a]/50 text-foreground" placeholder="Crafted from premium linen..." />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Price (₹) *</label>
                <Input name="basePrice" type="number" required className="h-9 text-xs mt-1" placeholder="799" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Category *</label>
                <select name="category" required className="w-full h-9 mt-1 border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50">
                  <option value="linen">Linen</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="premium">Premium</option>
                  <option value="ethnic">Ethnic</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Fabric</label>
                <select name="fabric" className="w-full h-9 mt-1 border border-border bg-background px-3 text-xs text-foreground">
                  <option value="100% Premium Linen">100% Premium Linen</option>
                  <option value="Premium Cotton">Premium Cotton</option>
                  <option value="Cotton-Linen Blend">Cotton-Linen Blend</option>
                  <option value="Egyptian Cotton">Egyptian Cotton</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Fit</label>
                <select name="fit" className="w-full h-9 mt-1 border border-border bg-background px-3 text-xs text-foreground">
                  <option value="regular">Regular</option>
                  <option value="slim">Slim</option>
                  <option value="relaxed">Relaxed</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Tags (comma separated)</label>
                <Input name="tags" className="h-9 text-xs mt-1" placeholder="linen, summer, bestseller, new-launch" />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" name="isFeatured" id="feat" className="accent-[#c4956a]" />
                <label htmlFor="feat" className="text-xs text-foreground">Featured / Bestseller</label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-3 flex items-center gap-1.5"><ImageIcon className="h-3 w-3" /> Product Images</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Main Image URL *</label>
                <Input value={mainImage} onChange={e => setMainImage(e.target.value)} className="h-9 text-xs mt-1" placeholder="https://... (primary product photo)" />
                {mainImage && (
                  <div className="mt-2 relative h-32 w-24 border border-border overflow-hidden">
                    <Image src={mainImage} alt="Main" fill className="object-cover" />
                    <span className="absolute top-1 left-1 text-[8px] bg-[#c4956a] text-white px-1">MAIN</span>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Sub Images (comma separated URLs)</label>
                <Input name="imageUrl" className="h-9 text-xs mt-1" placeholder="url1, url2, url3..." />
                <div className="mt-2">
                  <FileUpload images={formImages} onChange={setFormImages} maxFiles={6} />
                </div>
              </div>
            </div>
          </div>

          {/* Color Variants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium flex items-center gap-1.5"><Palette className="h-3 w-3" /> Color Variants & Stock</p>
              <button type="button" onClick={addVariant} className="flex items-center gap-1 text-[10px] font-medium text-[#c4956a] hover:underline">
                <Plus className="h-3 w-3" /> Add Color
              </button>
            </div>

            {variants.length === 0 && (
              <div className="p-4 border border-dashed border-border text-center">
                <Palette className="h-5 w-5 mx-auto text-muted-foreground/30 mb-1" />
                <p className="text-[10px] text-muted-foreground">No color variants added yet</p>
                <button type="button" onClick={addVariant} className="text-[10px] text-[#c4956a] mt-1 hover:underline">+ Add first color variant</button>
              </div>
            )}

            {variants.map((variant, vi) => (
              <div key={vi} className="mb-4 p-4 border border-border bg-background">
                {/* Color Selection */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full border-2 border-border" style={{ backgroundColor: variant.hex }} />
                    <div>
                      <input
                        value={variant.color}
                        onChange={e => updateVariantColor(vi, e.target.value, variant.hex)}
                        placeholder="Color name"
                        className="text-xs font-medium border-none bg-transparent outline-none text-foreground w-32"
                      />
                      <input
                        type="color"
                        value={variant.hex}
                        onChange={e => updateVariantColor(vi, variant.color, e.target.value)}
                        className="h-4 w-8 cursor-pointer border-none"
                      />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeVariant(vi)} className="text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Preset Colors */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {PRESET_COLORS.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => selectPresetColor(vi, preset)}
                      className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${variant.hex === preset.hex ? "border-[#c4956a] scale-110" : "border-border"}`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    />
                  ))}
                </div>

                {/* Sizes & Stock */}
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-2">Sizes & Stock (pieces available)</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map(size => {
                    const sizeData = variant.sizes.find(s => s.size === size)
                    const isActive = !!sizeData
                    return (
                      <div key={size} className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleVariantSize(vi, size)}
                          className={`h-8 w-10 border text-[10px] font-medium transition-colors ${isActive ? "border-[#c4956a] bg-[#c4956a]/10 text-foreground" : "border-border text-muted-foreground/40"}`}
                        >
                          {size}
                        </button>
                        {isActive && (
                          <input
                            type="number"
                            value={sizeData!.stock}
                            onChange={e => updateVariantStock(vi, variant.sizes.indexOf(sizeData!), Number(e.target.value))}
                            className="w-10 h-5 text-[9px] text-center border border-border bg-background text-foreground"
                            min={0}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Variant-specific images */}
                <div className="mt-3">
                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Variant Images (optional, comma URLs)</label>
                  <input
                    value={variant.images.join(", ")}
                    onChange={e => { const nv = [...variants]; nv[vi].images = e.target.value.split(",").map(s => s.trim()).filter(Boolean); setVariants(nv) }}
                    className="w-full mt-1 px-2 py-1.5 border border-border bg-background text-[10px] text-foreground"
                    placeholder="Leave empty to use main product images"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button type="submit" size="sm" className="text-xs">Create Product</Button>
            <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
            {variants.length > 0 && (
              <span className="text-[10px] text-muted-foreground self-center ml-auto">
                {variants.length} color(s) × {variants.reduce((s, v) => s + v.sizes.length, 0)} size variants = {variants.reduce((s, v) => s + v.sizes.length, 0)} SKUs
              </span>
            )}
          </div>
        </form>
      )}

      {/* Products Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Try a different search or add a new product." />
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-card">
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="p-3 w-8"><input type="checkbox" checked={selected.size === filtered.slice(0, 40).length && filtered.length > 0} onChange={toggleAll} className="accent-[#c4956a]" /></th>
                <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Product</th>
                <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Price</th>
                <th className="p-3 font-medium text-[10px] uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="p-3 font-medium text-[10px] uppercase tracking-wider hidden md:table-cell">Tags</th>
                <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Featured</th>
                <th className="p-3 font-medium text-[10px] uppercase tracking-wider w-16">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice(0, 40).map((product) => (
                <tr key={product._id} className={`transition-colors ${selected.has(product._id) ? "bg-[#c4956a]/5" : "hover:bg-card/50"}`}>
                  <td className="p-3"><input type="checkbox" checked={selected.has(product._id)} onChange={() => toggleSelect(product._id)} className="accent-[#c4956a]" /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 bg-card border border-border overflow-hidden relative flex-shrink-0">
                        {product.images?.[0] && <Image src={product.images[0]} alt="" fill className="object-contain p-0.5" sizes="36px" />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/products/${product._id}`} className="font-medium truncate max-w-[180px] text-foreground hover:text-[#c4956a] transition-colors block">{product.name}</Link>
                        <p className="text-[10px] text-muted-foreground truncate">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-medium text-foreground">₹{product.basePrice?.toLocaleString()}</td>
                  <td className="p-3 hidden md:table-cell"><StatusBadge status={product.category} /></td>
                  <td className="p-3 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {product.tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <button onClick={() => updateProduct(product._id, { isFeatured: !product.isFeatured })}>
                      <Star className={`h-3.5 w-3.5 transition-colors ${product.isFeatured ? "fill-[#c4956a] text-[#c4956a]" : "text-muted-foreground/30 hover:text-[#c4956a]"}`} />
                    </button>
                  </td>
                  <td className="p-3">
                    <button onClick={() => setDeleteDialog({ open: true, type: "single", id: product._id })} className="text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 40 && (
            <div className="p-3 text-center text-[10px] text-muted-foreground border-t border-border">
              Showing 40 of {filtered.length}. Use search to find specific items.
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: "single" })}
        onConfirm={confirmDelete}
        title={deleteDialog.type === "bulk" ? `Delete ${selected.size} Product(s)?` : "Delete Product?"}
        description={deleteDialog.type === "bulk"
          ? `You are about to permanently delete ${selected.size} product(s) and all their variants. This cannot be undone.`
          : "This product and all its variants will be permanently deleted."
        }
        confirmText="Delete Permanently"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
