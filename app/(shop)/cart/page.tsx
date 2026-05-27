"use client"

import { useCartStore } from "@/store/cartStore"
import { Minus, Plus, Trash2, Tag, ShoppingBag, ArrowRight, Truck, RotateCcw, Shield, ChevronDown, X, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, applyCoupon, couponCode, discount, clearCoupon } = useCartStore()
  const [code, setCode] = useState("")
  const [couponError, setCouponError] = useState("")
  const [applying, setApplying] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [variants, setVariants] = useState<Record<string, any[]>>({})
  const [recommendations, setRecommendations] = useState<any[]>([])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 999 ? 0 : 49
  const total = subtotal - discount + shipping

  // Fetch recommendations
  useEffect(() => {
    fetch("/api/products?limit=4&featured=true")
      .then(r => r.json())
      .then(data => {
        const prods = data.products || data || []
        const cartIds = items.map(i => i._id.split("-")[0])
        setRecommendations(prods.filter((p: any) => !cartIds.includes(p._id)).slice(0, 4))
      })
      .catch(() => {})
  }, [items])

  // Fetch variants for editing
  async function fetchVariants(productId: string) {
    if (variants[productId]) return
    try {
      const res = await fetch(`/api/products/${productId}/variants`)
      const data = await res.json()
      setVariants(prev => ({ ...prev, [productId]: data.variants || data || [] }))
    } catch {}
  }

  function handleEditItem(item: any) {
    const productId = item._id.split("-")[0] || item._id
    fetchVariants(productId)
    setEditingItem(editingItem === item._id + item.sku ? null : item._id + item.sku)
  }

  function handleVariantChange(item: any, variant: any) {
    removeItem(item._id)
    const { addItem } = useCartStore.getState()
    addItem({
      _id: variant.product || item._id.split("-")[0],
      name: item.name,
      slug: item.slug,
      images: variant.images?.length ? variant.images : item.images,
      price: (item.price - (item.priceAdjustment || 0)) + (variant.priceAdjustment || 0),
      quantity: item.quantity,
      sku: variant.sku,
      variantId: variant._id,
      size: variant.size,
      color: variant.color?.name || item.color,
    })
    setEditingItem(null)
  }

  async function handleApplyCoupon() {
    if (!code.trim()) return
    setCouponError("")
    setApplying(true)
    const res = await fetch(`/api/coupons/validate?code=${code.toUpperCase()}&amount=${subtotal}`)
    const data = await res.json()
    if (!res.ok) {
      setCouponError(data.error || "Invalid coupon")
    } else {
      applyCoupon(code.toUpperCase(), data.discount)
    }
    setApplying(false)
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 border border-[#c4956a]/20 rounded-full flex items-center justify-center">
          <ShoppingBag className="h-7 w-7 text-[#c4956a]/40" />
        </div>
        <h1 className="text-xl font-medium text-foreground mb-2">Your bag is empty</h1>
        <p className="text-sm text-muted-foreground mb-6">Add some premium shirts to get started</p>
        <Link href="/shirts" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity">
          Shop Collection <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-6 md:py-10 max-w-5xl">
      <h1 className="text-lg md:text-xl font-medium text-foreground mb-6">Shopping Bag ({items.length})</h1>

      <div className="grid lg:grid-cols-[1fr,360px] gap-8">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => {
            const productId = item._id.split("-")[0] || item._id
            const itemKey = item._id + item.sku
            const isEditing = editingItem === itemKey
            const itemVariants = variants[productId] || []

            return (
              <div key={itemKey} className="border border-border bg-card hover:border-[#c4956a]/20 transition-colors">
                {/* Main item row */}
                <div className="flex gap-4 p-4">
                  <Link href={`/product/${item.slug}`} className="relative h-32 w-24 md:h-36 md:w-28 overflow-hidden bg-secondary flex-shrink-0 border border-border">
                    <Image src={item.images?.[0] || "/placeholder.jpg"} alt={item.name} fill className="object-cover" sizes="112px" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/product/${item.slug}`} className="text-sm font-medium text-foreground hover:text-[#c4956a] transition-colors line-clamp-2">{item.name}</Link>
                      <button onClick={() => removeItem(item._id)} className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Selected options */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-[10px] font-medium text-foreground rounded">
                        Size: {item.size}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-[10px] font-medium text-foreground rounded">
                        Color: {item.color}
                      </span>
                    </div>

                    {/* Edit size/color button */}
                    <button
                      onClick={() => handleEditItem(item)}
                      className="mt-2 text-[10px] text-[#c4956a] uppercase tracking-wider font-medium hover:underline flex items-center gap-1"
                    >
                      Change Size/Color <ChevronDown className={`h-3 w-3 transition-transform ${isEditing ? "rotate-180" : ""}`} />
                    </button>

                    {/* Price and quantity */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="h-7 w-7 border border-border flex items-center justify-center hover:border-[#c4956a]/30 transition-colors">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs w-7 text-center font-medium text-foreground">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="h-7 w-7 border border-border flex items-center justify-center hover:border-[#c4956a]/30 transition-colors">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Variant selector (expanded) */}
                {isEditing && (
                  <div className="px-4 pb-4 border-t border-border pt-3">
                    {itemVariants.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Loading options...</p>
                    ) : (
                      <div className="space-y-3">
                        {/* Available sizes */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Size</p>
                          <div className="flex flex-wrap gap-1.5">
                            {[...new Set(itemVariants.map(v => v.size))].map(size => (
                              <button
                                key={size}
                                className={`px-3 py-1.5 text-xs border transition-colors ${item.size === size ? "border-[#c4956a] bg-[#c4956a]/10 text-[#c4956a] font-medium" : "border-border hover:border-[#c4956a]/30 text-foreground"}`}
                                onClick={() => {
                                  const match = itemVariants.find(v => v.size === size && v.color?.name === item.color) || itemVariants.find(v => v.size === size)
                                  if (match) handleVariantChange(item, match)
                                }}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Available colors */}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Color</p>
                          <div className="flex flex-wrap gap-1.5">
                            {[...new Map(itemVariants.map(v => [v.color?.name, v.color])).values()].filter(Boolean).map((color: any) => (
                              <button
                                key={color.name}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors ${item.color === color.name ? "border-[#c4956a] bg-[#c4956a]/10 font-medium" : "border-border hover:border-[#c4956a]/30"}`}
                                onClick={() => {
                                  const match = itemVariants.find(v => v.color?.name === color.name && v.size === item.size) || itemVariants.find(v => v.color?.name === color.name)
                                  if (match) handleVariantChange(item, match)
                                }}
                              >
                                <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: color.hex }} />
                                <span className="text-foreground">{color.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Item-level delivery & return info */}
                <div className="px-4 pb-3 flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Truck className="h-3 w-3 text-[#c4956a]" /> Delivery in 3-5 days</span>
                  <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3 text-[#c4956a]" /> 14-day easy returns</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
          <div className="p-5 border border-border bg-card">
            <h2 className="text-sm font-medium text-foreground mb-4">Order Summary</h2>

            {/* Coupon */}
            {!couponCode ? (
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      className="w-full pl-9 pr-3 py-2.5 border border-border bg-background text-xs font-mono uppercase focus:outline-none focus:border-[#c4956a]/50 text-foreground placeholder:text-muted-foreground/50 placeholder:normal-case"
                    />
                  </div>
                  <button onClick={handleApplyCoupon} disabled={!code || applying} className="px-4 py-2.5 border border-[#c4956a]/30 text-[10px] font-medium uppercase tracking-wider text-[#c4956a] hover:bg-[#c4956a]/5 disabled:opacity-40 transition-colors">
                    {applying ? "..." : "Apply"}
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 mt-1.5">{couponError}</p>}
                <p className="text-[10px] text-muted-foreground mt-2">Try: WELCOME10, LINEN15, FLAT100</p>
              </div>
            ) : (
              <div className="mb-4 pb-4 border-b border-border flex items-center justify-between p-2.5 bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{couponCode} applied — ₹{discount} off</span>
                </div>
                <button onClick={clearCoupon} className="text-[10px] text-muted-foreground hover:text-red-500 transition-colors">Remove</button>
              </div>
            )}

            {/* Pricing */}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shipping === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}>
                  {shipping === 0 ? "Free" : `₹${shipping}`}
                </span>
              </div>
            </div>

            {shipping > 0 && (
              <p className="text-[10px] text-[#c4956a] mt-2">Add ₹{(999 - subtotal).toLocaleString()} more for free shipping</p>
            )}

            <div className="border-t border-border mt-4 pt-4 flex justify-between font-semibold text-base">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">₹{total.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">You&apos;re saving ₹{discount.toLocaleString()} on this order</p>
            )}

            <Link href="/checkout" className="block w-full mt-5 py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-center text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity">
              Proceed to Checkout
            </Link>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 border border-border">
              <Truck className="h-3.5 w-3.5 mx-auto text-[#c4956a]" />
              <p className="text-[9px] text-muted-foreground mt-1">Free Shipping 999+</p>
            </div>
            <div className="p-2.5 border border-border">
              <RotateCcw className="h-3.5 w-3.5 mx-auto text-[#c4956a]" />
              <p className="text-[9px] text-muted-foreground mt-1">14-Day Returns</p>
            </div>
            <div className="p-2.5 border border-border">
              <Shield className="h-3.5 w-3.5 mx-auto text-[#c4956a]" />
              <p className="text-[9px] text-muted-foreground mt-1">Secure Checkout</p>
            </div>
          </div>

          {/* Return Policy Summary */}
          <div className="p-4 border border-border bg-card/50">
            <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-2">Return & Exchange Policy</p>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> 14-day hassle-free returns</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Free exchange on size issues</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> Refund within 5-7 business days</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span> No questions asked policy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      {recommendations.length > 0 && (
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-sm font-medium text-foreground mb-5 uppercase tracking-wider">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((product: any) => (
              <Link key={product._id} href={`/product/${product.slug}`} className="group border border-border hover:border-[#c4956a]/20 transition-colors">
                <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
                  <Image src={product.images?.[0] || "/placeholder.jpg"} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 50vw, 25vw" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-foreground line-clamp-1">{product.name}</p>
                  <p className="text-xs text-[#c4956a] font-semibold mt-1">₹{product.basePrice?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
