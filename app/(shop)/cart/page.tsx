"use client"

import { useCartStore } from "@/store/cartStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, applyCoupon, couponCode, discount, clearCoupon } = useCartStore()
  const [code, setCode] = useState("")
  const [couponError, setCouponError] = useState("")

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 999 ? 0 : 50
  const total = subtotal - discount + shipping

  async function handleApplyCoupon() {
    setCouponError("")
    const res = await fetch(`/api/coupons/validate?code=${code}&amount=${subtotal}`)
    const data = await res.json()
    if (!res.ok) {
      setCouponError(data.error)
    } else {
      applyCoupon(code, data.discount)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to get started.</p>
        <Link href="/products"><Button>Shop Now</Button></Link>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id + item.sku} className="flex gap-4 p-4 rounded-lg border border-border/50 bg-card/50">
              <div className="relative h-24 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <Image src={item.images?.[0] || "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.slug}`} className="font-medium hover:text-primary transition-colors">{item.name}</Link>
                <p className="text-xs text-muted-foreground mt-1">{item.size} / {item.color}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="h-7 w-7 rounded bg-secondary flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="h-7 w-7 rounded bg-secondary flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                  </div>
                  <p className="font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                  <button onClick={() => removeItem(item._id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-6 rounded-lg border border-border/50 bg-card/50 h-fit space-y-4">
          <h2 className="font-bold text-lg">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-500"><span>Discount ({couponCode})</span><span>-₹{discount.toLocaleString()}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
          </div>
          <div className="border-t border-border/50 pt-3 flex justify-between font-bold text-lg">
            <span>Total</span><span className="text-primary">₹{total.toLocaleString()}</span>
          </div>

          {/* Coupon */}
          {!couponCode ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} className="text-sm" />
                <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={!code}>Apply</Button>
              </div>
              {couponError && <p className="text-xs text-destructive">{couponError}</p>}
            </div>
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-500">✓ {couponCode} applied</span>
              <button onClick={clearCoupon} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
            </div>
          )}

          <Link href="/checkout"><Button className="w-full">Proceed to Checkout</Button></Link>
        </div>
      </div>
    </div>
  )
}
