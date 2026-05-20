"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Star, Search } from "lucide-react"
import Image from "next/image"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch("/api/products?limit=50").then(r => r.json()).then(d => { setProducts(d.products || []); setLoading(false) })
  }, [])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = fd.get("name") as string
    const res = await fetch("/api/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now(),
        description: fd.get("description"), basePrice: Number(fd.get("basePrice")),
        category: fd.get("category"), tags: (fd.get("tags") as string || "").split(",").map(t => t.trim()).filter(Boolean),
        images: (fd.get("images") as string || "").split(",").map(t => t.trim()).filter(Boolean),
        isFeatured: fd.get("isFeatured") === "on", isActive: true,
      }),
    })
    if (res.ok) { const p = await res.json(); setProducts([p, ...products]); setShowForm(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    setProducts(products.filter(p => p._id !== id))
  }

  async function toggleFeatured(id: string, current: boolean) {
    await fetch(`/api/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isFeatured: !current }) })
    setProducts(products.map(p => p._id === id ? { ...p, isFeatured: !current } : p))
  }

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="text-sm text-muted-foreground">Loading products...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Products</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{products.length} products in catalog</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="text-xs h-8">
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-xs" />
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="p-4 rounded-lg border bg-card space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="text-[11px] text-muted-foreground">Name</label><Input name="name" required className="h-8 text-xs mt-1" /></div>
            <div className="col-span-2"><label className="text-[11px] text-muted-foreground">Description</label><Input name="description" required className="h-8 text-xs mt-1" /></div>
            <div><label className="text-[11px] text-muted-foreground">Price (₹)</label><Input name="basePrice" type="number" required className="h-8 text-xs mt-1" /></div>
            <div><label className="text-[11px] text-muted-foreground">Category</label>
              <select name="category" required className="w-full h-8 mt-1 rounded-md border bg-background px-2 text-xs">
                <option value="formal">Formal</option><option value="casual">Casual</option><option value="ethnic">Ethnic</option>
              </select>
            </div>
            <div><label className="text-[11px] text-muted-foreground">Tags (comma sep)</label><Input name="tags" className="h-8 text-xs mt-1" placeholder="linen, summer" /></div>
            <div><label className="text-[11px] text-muted-foreground">Image URL</label><Input name="images" className="h-8 text-xs mt-1" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" name="isFeatured" id="feat" /><label htmlFor="feat" className="text-xs">Featured</label></div>
          </div>
          <div className="flex gap-2"><Button type="submit" size="sm" className="text-xs h-7">Create</Button><Button type="button" variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </form>
      )}

      {/* Products Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium hidden md:table-cell">Category</th>
              <th className="p-3 font-medium">Featured</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.slice(0, 30).map((product) => (
              <tr key={product._id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded bg-muted overflow-hidden relative flex-shrink-0">
                      {product.images?.[0] && <Image src={product.images[0]} alt="" fill className="object-cover" />}
                    </div>
                    <span className="font-medium truncate max-w-[180px]">{product.name}</span>
                  </div>
                </td>
                <td className="p-3 font-medium">₹{product.basePrice?.toLocaleString()}</td>
                <td className="p-3 capitalize text-muted-foreground hidden md:table-cell">{product.category}</td>
                <td className="p-3">
                  <button onClick={() => toggleFeatured(product._id, product.isFeatured)}>
                    <Star className={`h-3.5 w-3.5 ${product.isFeatured ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                  </button>
                </td>
                <td className="p-3">
                  <button onClick={() => handleDelete(product._id)} className="text-muted-foreground hover:text-red-500 transition-colors">
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
