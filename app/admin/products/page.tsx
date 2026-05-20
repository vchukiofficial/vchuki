"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Upload, Star, X } from "lucide-react"
import Image from "next/image"

interface Product {
  _id: string
  name: string
  slug: string
  description: string
  basePrice: number
  category: string
  tags: string[]
  images: string[]
  isActive: boolean
  isFeatured: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((data) => { setProducts(data.products || []); setLoading(false) })
  }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    setUploading(true)

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        setUploadedImages((prev) => [...prev, data.url])
      }
    }
    setUploading(false)
  }

  function removeImage(url: string) {
    setUploadedImages((prev) => prev.filter((img) => img !== url))
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = fd.get("name") as string
    const body = {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: fd.get("description"),
      basePrice: Number(fd.get("basePrice")),
      category: fd.get("category"),
      tags: (fd.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean),
      images: uploadedImages.length > 0 ? uploadedImages : (fd.get("imageUrl") as string).split(",").map((t) => t.trim()).filter(Boolean),
      isFeatured: fd.get("isFeatured") === "on",
      isActive: true,
    }
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const product = await res.json()
      setProducts([product, ...products])
      setShowForm(false)
      setUploadedImages([])
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return
    await fetch(`/api/products/${id}`, { method: "DELETE" })
    setProducts(products.filter((p) => p._id !== id))
  }

  async function toggleFeatured(id: string, current: boolean) {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !current }),
    })
    setProducts(products.map((p) => p._id === id ? { ...p, isFeatured: !current } : p))
  }

  if (loading) return <div className="text-muted-foreground">Loading products...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <Button size="sm" onClick={() => { setShowForm(!showForm); setUploadedImages([]) }}>
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-5 rounded-lg border border-border/50 bg-card/50 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Product Name</Label><Input name="name" required placeholder="Classic Oxford Shirt" /></div>
            <div className="col-span-2"><Label>Description</Label><Input name="description" required placeholder="Premium cotton shirt..." /></div>
            <div><Label>Price (₹)</Label><Input name="basePrice" type="number" required placeholder="1499" /></div>
            <div><Label>Category</Label>
              <select name="category" required className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="ethnic">Ethnic</option>
              </select>
            </div>
            <div><Label>Tags (comma separated)</Label><Input name="tags" placeholder="cotton, slim, summer" /></div>
            <div className="flex items-end gap-2">
              <input type="checkbox" name="isFeatured" id="isFeatured" className="accent-primary" />
              <Label htmlFor="isFeatured">Featured Product</Label>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Product Images</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {uploadedImages.map((url) => (
                <div key={url} className="relative h-20 w-20 rounded-md overflow-hidden border border-border/50">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button type="button" onClick={() => removeImage(url)} className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              <label className="h-20 w-20 rounded-md border-2 border-dashed border-border/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground mt-1">{uploading ? "..." : "Upload"}</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <div className="mt-2">
              <Label className="text-xs text-muted-foreground">Or paste image URL</Label>
              <Input name="imageUrl" placeholder="https://..." className="mt-1" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm">Create Product</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/50">
            <tr className="text-left text-muted-foreground">
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Category</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t border-border/50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted overflow-hidden relative flex-shrink-0">
                      {product.images[0] && <Image src={product.images[0]} alt="" fill className="object-cover" />}
                    </div>
                    <div>
                      <span className="font-medium truncate block max-w-[200px]">{product.name}</span>
                      <span className="text-[10px] text-muted-foreground">{product.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3 font-medium">₹{product.basePrice.toLocaleString()}</td>
                <td className="p-3 capitalize">{product.category}</td>
                <td className="p-3">
                  <button onClick={() => toggleFeatured(product._id, product.isFeatured)} className="flex items-center gap-1" title="Toggle featured">
                    <Star className={`h-4 w-4 ${product.isFeatured ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                  </button>
                </td>
                <td className="p-3">
                  <button onClick={() => handleDelete(product._id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
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
