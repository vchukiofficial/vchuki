"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/store/cartStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, discount, couponCode, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod")

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 999 ? 0 : 50
  const total = subtotal - discount + shipping

  if (!session) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to checkout</h1>
        <Link href="/auth/login"><Button>Sign In</Button></Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/products"><Button>Shop Now</Button></Link>
      </div>
    )
  }

  async function handlePlaceOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const address = {
      name: formData.get("name") as string,
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zip: formData.get("zip") as string,
      phone: formData.get("phone") as string,
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          product: item._id,
          variant: item.variantId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: address,
        paymentMethod,
        couponCode,
        totalAmount: subtotal,
        discountAmount: discount,
        finalAmount: total,
      }),
    })

    if (res.ok) {
      clearCart()
      router.push("/account/orders")
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid md:grid-cols-2 gap-8">
        {/* Address */}
        <div className="space-y-4">
          <h2 className="font-semibold">Shipping Address</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label htmlFor="name">Full Name</Label><Input id="name" name="name" required /></div>
            <div className="col-span-2"><Label htmlFor="street">Street Address</Label><Input id="street" name="street" required /></div>
            <div><Label htmlFor="city">City</Label><Input id="city" name="city" required /></div>
            <div><Label htmlFor="state">State</Label><Input id="state" name="state" required /></div>
            <div><Label htmlFor="zip">PIN Code</Label><Input id="zip" name="zip" required /></div>
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" required /></div>
          </div>

          <h2 className="font-semibold pt-4">Payment Method</h2>
          <div className="space-y-2">
            {(["cod", "razorpay"] as const).map((method) => (
              <label key={method} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === method ? "border-primary bg-primary/5" : "border-border/50"}`}>
                <input type="radio" name="payment" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="accent-primary" />
                <span className="text-sm capitalize">{method === "cod" ? "Cash on Delivery" : "Razorpay (UPI/Card)"}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 rounded-lg border border-border/50 bg-card/50 h-fit space-y-4">
          <h2 className="font-semibold">Order Summary</h2>
          <div className="space-y-2 text-sm max-h-48 overflow-auto">
            {items.map((item) => (
              <div key={item._id + item.sku} className="flex justify-between">
                <span className="text-muted-foreground truncate mr-2">{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border/50 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>-₹{discount}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
          </div>
          <div className="border-t border-border/50 pt-3 flex justify-between font-bold text-lg">
            <span>Total</span><span className="text-primary">₹{total.toLocaleString()}</span>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  )
}
