"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { useCartStore } from "@/store/cartStore"
import Image from "next/image"
import Link from "next/link"
import { Check, Shield, Truck, ArrowLeft, CreditCard, Banknote, Package, Clock, MapPin, ShoppingBag } from "lucide-react"

type Step = "details" | "payment" | "confirmation"

export default function CheckoutPage() {
  const { data: session } = useSession()
  const { items, discount, comboDiscount, comboLabel, couponCode, clearCart } = useCartStore()
  const [step, setStep] = useState<Step>("details")
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod")

  // Form state
  const [form, setForm] = useState({
    email: session?.user?.email || "",
    phone: "",
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  })

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 1599 ? 0 : 50
  const codCharge = paymentMethod === "cod" ? 50 : 0
  const totalDiscount = discount + comboDiscount
  const total = subtotal - totalDiscount + shipping + codCharge

  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 border border-[#c4956a]/20 rounded-full flex items-center justify-center">
          <ShoppingBag className="h-7 w-7 text-[#c4956a]/40" />
        </div>
        <h1 className="text-xl font-medium text-foreground mb-2">Your bag is empty</h1>
        <p className="text-sm text-muted-foreground mb-6">Add some premium shirts to get started</p>
        <Link href="/shirts" className="inline-flex px-6 py-3 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity">
          Shop Collection
        </Link>
      </div>
    )
  }

  function updateForm(field: string, value: string) {
    // Validate phone: only digits, max 10
    if (field === "phone") {
      const digits = value.replace(/\D/g, "")
      if (digits.length > 10) return
      setForm((prev) => ({ ...prev, phone: digits }))
      return
    }
    // Validate pincode: only digits, max 6
    if (field === "zip") {
      const digits = value.replace(/\D/g, "")
      if (digits.length > 6) return
      setForm((prev) => ({ ...prev, zip: digits }))
      return
    }
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleContinueToPayment(e: React.FormEvent) {
    e.preventDefault()
    // Validate phone
    if (form.phone.length !== 10) {
      alert("Please enter a valid 10-digit mobile number")
      return
    }
    // Validate pincode
    if (form.zip.length !== 6) {
      alert("Please enter a valid 6-digit PIN code")
      return
    }
    setStep("payment")
  }

  async function handlePlaceOrder() {
    setLoading(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product: item._id.split("-")[0] || item._id,
            variant: item.variantId,
            name: item.name,
            image: item.images?.[0] || "",
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          shippingAddress: {
            name: form.name,
            street: form.street,
            city: form.city,
            state: form.state,
            zip: form.zip,
            phone: form.phone,
          },
          guestEmail: session ? undefined : form.email,
          guestPhone: session ? undefined : form.phone,
          paymentMethod,
          couponCode,
          totalAmount: subtotal,
          discountAmount: totalDiscount,
          finalAmount: total,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setOrderId(data.orderId)
        clearCart()
        // Auto-login if account was created for guest
        if (data.autoCreatedUser && form.email && form.phone) {
          await signIn("credentials", { email: form.email, password: form.phone, redirect: false })
        }
        setStep("confirmation")
      } else {
        alert(data.error || "Order failed. Please try again.")
      }
    } catch {
      alert("Network error. Please check your connection and try again.")
    }
    setLoading(false)
  }

  // Order Confirmation
  if (step === "confirmation") {
    return (
      <div className="container py-12 md:py-20 max-w-lg mx-auto">
        {/* Success Icon */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
            <Check className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-medium text-foreground">Order Confirmed!</h1>
          <p className="text-sm text-muted-foreground mt-2">Thank you for shopping with VCHUKI</p>
        </div>

        {/* Order Details Card */}
        <div className="mt-8 border border-border bg-card p-5 space-y-4">
          {orderId && (
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Order ID</span>
              <span className="text-xs font-mono font-medium text-foreground">#{orderId.slice(-8).toUpperCase()}</span>
            </div>
          )}

          {/* What happens next */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium">What happens next</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Order Placed</p>
                  <p className="text-[10px] text-muted-foreground">We&apos;ve received your order</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#c4956a]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Package className="h-3 w-3 text-[#c4956a]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Packaging</p>
                  <p className="text-[10px] text-muted-foreground">Your shirt will be carefully packed within 24h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Truck className="h-3 w-3 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Shipping</p>
                  <p className="text-[10px] text-muted-foreground">Dispatched via premium courier</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Delivery</p>
                  <p className="text-[10px] text-muted-foreground">Estimated 3-5 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="pt-3 border-t border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Updates will be sent to</p>
            <p className="text-sm font-medium text-foreground">{form.email || session?.user?.email}</p>
            {form.phone && <p className="text-xs text-muted-foreground mt-0.5">{form.phone}</p>}
          </div>

          {/* Estimated delivery */}
          <div className="pt-3 border-t border-border flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[#c4956a]" />
            <p className="text-xs text-foreground">Estimated delivery: <span className="font-medium">{new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          {session && (
            <Link href="/account/orders" className="block w-full py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-center text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity">
              Track Order
            </Link>
          )}
          <Link href="/shirts" className="block w-full py-3 border border-border text-center text-xs font-medium tracking-wider uppercase hover:bg-card transition-colors text-foreground">
            Continue Shopping
          </Link>
        </div>

        {/* Need help */}
        <p className="text-center text-[10px] text-muted-foreground mt-6">
          Need help? <a href="https://wa.me/919252891189" target="_blank" rel="noopener noreferrer" className="text-[#c4956a] hover:underline">Chat with us on WhatsApp</a>
        </p>
      </div>
    )
  }

  return (
    <div className="container py-6 md:py-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/cart" className="h-8 w-8 border border-border rounded-full flex items-center justify-center hover:border-[#c4956a]/30 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <h1 className="text-lg md:text-xl font-medium text-foreground">Checkout</h1>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider">
          <span className={step === "details" ? "text-[#c4956a] font-medium" : "text-muted-foreground"}>Details</span>
          <span className="text-muted-foreground/30">→</span>
          <span className={step === "payment" ? "text-[#c4956a] font-medium" : "text-muted-foreground"}>Payment</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr,380px] gap-8 md:gap-12">
        {/* Left - Form */}
        <div>
          {step === "details" && (
            <form onSubmit={handleContinueToPayment} className="space-y-6">
              {/* Contact Info */}
              <div>
                <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#c4956a]/10 text-[#c4956a] text-[10px] font-bold flex items-center justify-center">1</span>
                  Contact Information
                </h2>
                {session ? (
                  <p className="text-sm text-muted-foreground mb-3">
                    Logged in as <span className="text-foreground font-medium">{session.user.email}</span>
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full mt-1 px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[#c4956a]/50 transition-colors text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Phone (for delivery updates)</label>
                      <div className="flex mt-1">
                        <span className="px-3 py-3 border border-r-0 border-border bg-muted text-sm text-muted-foreground">+91</span>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateForm("phone", e.target.value)}
                          required
                          pattern="[0-9]{10}"
                          maxLength={10}
                          placeholder="9252891189"
                          className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[#c4956a]/50 transition-colors text-foreground placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {session && (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Phone (for delivery updates)</label>
                    <div className="flex mt-1">
                      <span className="px-3 py-3 border border-r-0 border-border bg-muted text-sm text-muted-foreground">+91</span>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                        required
                        pattern="[0-9]{10}"
                        maxLength={10}
                        placeholder="9252891189"
                        className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[#c4956a]/50 transition-colors text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#c4956a]/10 text-[#c4956a] text-[10px] font-bold flex items-center justify-center">2</span>
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      required
                      placeholder="Your full name"
                      className="w-full mt-1 px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[#c4956a]/50 transition-colors text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Street Address</label>
                    <input
                      type="text"
                      value={form.street}
                      onChange={(e) => updateForm("street", e.target.value)}
                      required
                      placeholder="House no, Street, Locality"
                      className="w-full mt-1 px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[#c4956a]/50 transition-colors text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateForm("city", e.target.value)}
                      required
                      placeholder="City"
                      className="w-full mt-1 px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[#c4956a]/50 transition-colors text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">State</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => updateForm("state", e.target.value)}
                      required
                      placeholder="State"
                      className="w-full mt-1 px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[#c4956a]/50 transition-colors text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">PIN Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.zip}
                      onChange={(e) => updateForm("zip", e.target.value)}
                      required
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="342001"
                      className="w-full mt-1 px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[#c4956a]/50 transition-colors text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity"
              >
                Continue to Payment
              </button>
            </form>
          )}

          {step === "payment" && (
            <div className="space-y-6">
              {/* Delivery summary */}
              <div className="p-4 border border-border bg-card/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Delivering to</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{form.name}</p>
                    <p className="text-xs text-muted-foreground">{form.street}, {form.city}, {form.state} - {form.zip}</p>
                  </div>
                  <button onClick={() => setStep("details")} className="text-[10px] text-[#c4956a] uppercase tracking-wider font-medium hover:underline">
                    Edit
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#c4956a]/10 text-[#c4956a] text-[10px] font-bold flex items-center justify-center">3</span>
                  Payment Method
                </h2>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${paymentMethod === "razorpay" ? "border-[#c4956a] bg-[#c4956a]/5" : "border-border hover:border-[#c4956a]/30"}`}>
                    <input type="radio" name="payment" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="accent-[#c4956a]" />
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">UPI / Card / Net Banking</span>
                      <p className="text-[10px] text-muted-foreground">Razorpay secure payment</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">₹{(subtotal - totalDiscount + shipping).toLocaleString()}</span>
                  </label>
                  <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${paymentMethod === "cod" ? "border-[#c4956a] bg-[#c4956a]/5" : "border-border hover:border-[#c4956a]/30"}`}>
                    <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-[#c4956a]" />
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">Cash on Delivery</span>
                      <p className="text-[10px] text-muted-foreground">+₹50 COD charge · Pay when you receive</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">₹{(subtotal - totalDiscount + shipping + 50).toLocaleString()}</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Placing Order..." : `Place Order — ₹${total.toLocaleString()}`}
              </button>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground pt-2">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure</span>
                <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> 3-5 days delivery</span>
              </div>
            </div>
          )}
        </div>

        {/* Right - Order Summary (sticky) */}
        <div className="md:sticky md:top-20 md:self-start">
          <div className="p-5 border border-border bg-card/50">
            <h2 className="text-sm font-medium text-foreground mb-4">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 max-h-60 overflow-auto no-scrollbar">
              {items.map((item) => (
                <div key={item._id + item.sku} className="flex gap-3">
                  <div className="relative h-16 w-12 bg-secondary overflow-hidden flex-shrink-0 border border-border">
                    <Image src={item.images?.[0] || "/placeholder.jpg"} alt={item.name} fill className="object-cover" sizes="48px" />
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-[#c4956a] text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.size} / {item.color}</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Coupon {couponCode && `(${couponCode})`}</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              {comboDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Combo Offer {comboLabel && `(${comboLabel})`}</span>
                  <span>-₹{comboDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}>
                  {shipping === 0 ? "Free" : `₹${shipping}`}
                </span>
              </div>
              {codCharge > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>COD Charge</span>
                  <span className="text-foreground">₹{codCharge}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border mt-3 pt-3 flex justify-between font-semibold text-base">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">₹{total.toLocaleString()}</span>
            </div>

            {shipping > 0 && (
              <p className="text-[10px] text-muted-foreground mt-2">Add ₹{(1599 - subtotal).toLocaleString()} more for free shipping</p>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 border border-border">
              <Shield className="h-3.5 w-3.5 mx-auto text-[#c4956a]" />
              <p className="text-[9px] text-muted-foreground mt-1">Secure</p>
            </div>
            <div className="p-2 border border-border">
              <Truck className="h-3.5 w-3.5 mx-auto text-[#c4956a]" />
              <p className="text-[9px] text-muted-foreground mt-1">3-5 Days</p>
            </div>
            <div className="p-2 border border-border">
              <Check className="h-3.5 w-3.5 mx-auto text-[#c4956a]" />
              <p className="text-[9px] text-muted-foreground mt-1">Genuine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
