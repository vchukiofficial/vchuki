"use client"

import { useEffect, useState } from "react"
import { useAdminStore } from "@/store/adminStore"
import { StatusBadge, FileUpload, SectionHeader, EmptyState } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Star, Search, Package, X } from "lucide-react"
import Image from "next/image"

export default function AdminProductsPage() {
  const { products, loading, fetchProducts, deleteProduct, updateProduct, createProduct } = useAdminStore()
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formImages, setFormImages] = useState<string[]>([])
  const [variants, setVariants] = useState<{ color: string; hex: string; sizes: string; stock: string }[]>([])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  function addVariant() {
    setVariants([...variants, { color: "", hex: "#000000", sizes: "S,M,L,XL,XXL", stock: "50" }])
  }

  function removeVariant(i: number) {
    setVariants(variants.filter((_, idx) => idx !== i))
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = fd.get("name") as string

    const product = await createProduct({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now(),
      description: fd.get("description"),
      basePrice: Number(fd.get("basePrice")),
      category: fd.get("category"),
      tags: (fd.get("tags") as string || "").split(",").map(t => t.trim()).filter(Boolean),
      images: formImages.length > 0 ? formImages : (fd.get("imageUrl") as string || "").split(",").map(t => t.trim()).filter(Boolean),
      isFeatured: fd.get("isFeatured") === "on",
      isActive: true,
    })

    if (product) {
      setShowForm(false)
      setFormImages([])
      setVariants([])
    }
  }

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))

  if (loading.products) return <div className="text-sm text-muted-foreground animate-pulse">Loading products...</div>

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Products"
        description={`${products.length} products in catalog`}
        action={
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="text-xs h-8 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Product
          </Button>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="p-5 rounded-lg border bg-card space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">New Product</h3>
            <button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Product Name *</label>
              <Input name="name" required className="h-9 text-xs mt-1" placeholder="Premium Oxford Shirt - White" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Description *</label>
              <textarea name="description" required className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-xs resize-none h-20" placeholder="Crafted from premium cotton..." />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Price (₹) *</label>
              <Input name="basePrice" type="number" required className="h-9 text-xs mt-1" placeholder="1499" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Category *</label>
              <select name="category" required className="w-full h-9 mt-1 rounded-md border bg-background px-3 text-xs">
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="ethnic">Ethnic</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Tags</label>
              <Input name="tags" className="h-9 text-xs mt-1" placeholder="linen, summer, bestseller, new-launch" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" name="isFeatured" id="feat" className="accent-foreground" />
              <label htmlFor="feat" className="text-xs">Featured / Bestseller</label>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Product Images</label>
            <div className="mt-2">
              <FileUpload images={formImages} onChange={setFormImages} maxFiles={8} />
            </div>
            <div className="mt-2">
              <Input name="imageUrl" className="h-8 text-xs" placeholder="Or paste image URLs (comma separated)" />
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Variants (Optional)</label>
              <button type="button" onClick={addVariant} className="text-[10px] text-foreground hover:underline">+ Add Variant</button>
            </div>
            {variants.length > 0 && (
              <div className="mt-2 space-y-2">
                {variants.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded border bg-muted/30">
                    <input type="color" value={v.hex} onChange={e => { const nv = [...variants]; nv[i].hex = e.target.value; setVariants(nv) }} className="h-7 w-7 rounded border cursor-pointer" />
                    <Input value={v.color} onChange={e => { const nv = [...variants]; nv[i].color = e.target.value; setVariants(nv) }} placeholder="Color name" className="h-7 text-[11px] flex-1" />
                    <Input value={v.sizes} onChange={e => { const nv = [...variants]; nv[i].sizes = e.target.value; setVariants(nv) }} placeholder="S,M,L,XL" className="h-7 text-[11px] w-28" />
                    <Input value={v.stock} onChange={e => { const nv = [...variants]; nv[i].stock = e.target.value; setVariants(nv) }} placeholder="Stock" className="h-7 text-[11px] w-16" type="number" />
                    <button type="button" onClick={() => removeVariant(i)}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">SEO (Auto-generated if empty)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <Input name="metaTitle" className="h-8 text-xs" placeholder="Meta title" />
              <Input name="metaDescription" className="h-8 text-xs" placeholder="Meta description" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" size="sm" className="text-xs">Create Product</Button>
            <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Products Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Try a different search or add a new product." />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="p-3 font-medium">Product</th>
                <th className="p-3 font-medium">Price</th>
                <th className="p-3 font-medium hidden md:table-cell">Category</th>
                <th className="p-3 font-medium hidden md:table-cell">Tags</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.slice(0, 40).map((product) => (
                <tr key={product._id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded bg-muted overflow-hidden relative flex-shrink-0">
                        {product.images?.[0] && <Image src={product.images[0]} alt="" fill className="object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[180px]">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-medium">₹{product.basePrice?.toLocaleString()}</td>
                  <td className="p-3 hidden md:table-cell"><StatusBadge status={product.category} /></td>
                  <td className="p-3 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {product.tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <button onClick={() => updateProduct(product._id, { isFeatured: !product.isFeatured })}>
                      <Star className={`h-3.5 w-3.5 transition-colors ${product.isFeatured ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30 hover:text-amber-500"}`} />
                    </button>
                  </td>
                  <td className="p-3">
                    <button onClick={() => deleteProduct(product._id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 40 && (
            <div className="p-3 text-center text-[11px] text-muted-foreground border-t">
              Showing 40 of {filtered.length} products. Use search to find specific items.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
