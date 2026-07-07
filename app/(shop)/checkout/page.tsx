"use client"

import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { useCartStore } from "@/store/cartStore"
import Image from "next/image"
import Link from "next/link"
import { Check, Shield, Truck, ArrowLeft, Banknote, Package, Clock, MapPin, ShoppingBag, Smartphone, Tag } from "lucide-react"
import { AddressForm } from "@/components/shared/AddressForm"
import { getRecaptchaToken, isRecaptchaEnabled } from "@/lib/recaptchaClient"
import type { Address } from "@/types"

type Step = "details" | "payment" | "confirmation"

export default function CheckoutPage() {
  const { data: session } = useSession()
  const { items, discount, comboDiscount, comboLabel, couponCode, clearCart, clearCoupon, applyCoupon } = useCartStore()
  const [step, setStep] = useState<Step>("details")
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [confirmedTotal, setConfirmedTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("cod")
  const [couponInput, setCouponInput] = useState("")
  const [couponError, setCouponError] = useState("")
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [autoApplyDismissedFor, setAutoApplyDismissedFor] = useState("")

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

  // Saved-address picker (logged-in users only)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState("")
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch("/api/users/me/addresses")
      .then((r) => r.json())
      .then((data) => {
        const addrs: Address[] = data.addresses || []
        setSavedAddresses(addrs)
        const def = addrs.find((a) => a.isDefault) || addrs[0]
        if (def) selectSavedAddress(def)
        else setShowNewAddressForm(true)
      })
      .catch(() => setShowNewAddressForm(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  function selectSavedAddress(addr: Address) {
    setSelectedAddressId(addr._id || "")
    setForm((prev) => ({
      ...prev,
      name: addr.name,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      phone: addr.phone || prev.phone,
    }))
    setShowNewAddressForm(false)
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    setCouponError("")
    setApplyingCoupon(true)
    try {
      const res = await fetch(`/api/coupons/validate?code=${couponInput.toUpperCase()}&amount=${subtotal}`)
      const data = await res.json()
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon")
      } else {
        applyCoupon(couponInput.toUpperCase(), data.discount)
        setCouponInput("")
      }
    } catch {
      setCouponError("Something went wrong. Try again.")
    }
    setApplyingCoupon(false)
  }

  // A coupon applied earlier (possibly in a past session) persists in the cart store — re-check it's
  // still valid and re-priced against the current subtotal each time checkout loads, rather than
  // silently trusting a stale flat amount from whenever it was first applied.
  useEffect(() => {
    if (!couponCode || subtotal <= 0) return
    fetch(`/api/coupons/validate?code=${couponCode}&amount=${subtotal}`)
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) clearCoupon()
        else if (data.discount !== discount) applyCoupon(couponCode, data.discount)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponCode, subtotal])

  // Auto-apply a discount once we know who's checking out — VIPACCESS10 for waitlist members
  // with early access, WELCOME10 for everyone else. Only runs while no coupon is applied yet,
  // so a manual entry or an explicit "Remove" always wins over this.
  useEffect(() => {
    const email = (form.email || session?.user?.email || "").trim().toLowerCase()
    if (couponCode || !email.includes("@") || subtotal <= 0 || email === autoApplyDismissedFor) return
    const timer = setTimeout(async () => {
      try {
        const checkRes = await fetch(`/api/waitlist/check?email=${encodeURIComponent(email)}`)
        const { earlyAccess } = await checkRes.json()
        const code = earlyAccess ? "VIPACCESS10" : "WELCOME10"
        const res = await fetch(`/api/coupons/validate?code=${code}&amount=${subtotal}`)
        const data = await res.json()
        if (res.ok) applyCoupon(code, data.discount)
      } catch {
        // silent — auto-apply is a bonus, not a blocker
      }
    }, 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.email, session?.user?.email, subtotal, couponCode, autoApplyDismissedFor])

  function handleRemoveCoupon() {
    setAutoApplyDismissedFor((form.email || session?.user?.email || "").trim().toLowerCase())
    clearCoupon()
  }

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
      const recaptchaToken = await getRecaptchaToken("checkout")
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recaptchaToken,
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
        setConfirmedTotal(total)
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
          <div className={`w-16 h-16 mx-auto mb-6 border rounded-full flex items-center justify-center ${paymentMethod === "upi" ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
            {paymentMethod === "upi" ? <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400" /> : <Check className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />}
          </div>
          <h1 className="text-2xl font-medium text-foreground">{paymentMethod === "upi" ? "Order Received — Payment Pending" : "Order Confirmed!"}</h1>
          <p className="text-sm text-muted-foreground mt-2">{paymentMethod === "upi" ? "Complete your UPI payment below to confirm this order" : "Thank you for shopping with VCHUKI"}</p>
        </div>

        {/* Order Details Card */}
        <div className="mt-8 border border-border bg-card p-5 space-y-4">
          {orderId && (
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Order ID</span>
              <span className="text-xs font-mono font-medium text-foreground">#{orderId.slice(-8).toUpperCase()}</span>
            </div>
          )}

          {/* UPI Payment */}
          {paymentMethod === "upi" && orderId && (
            <div className="p-4 border border-[#c4956a]/30 bg-[#c4956a]/5 space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium">Complete Your Payment</p>
              <p className="text-xs text-muted-foreground">Scan the QR code with any UPI app, or tap the button below on your phone.</p>
              <div className="flex justify-center">
                <img
                  src={`/api/upi-qr?amount=${confirmedTotal}&note=${encodeURIComponent(`VCHUKI Order ${orderId.slice(-8).toUpperCase()}`)}`}
                  alt="UPI payment QR code"
                  width={180}
                  height={180}
                  className="border border-border bg-white p-2"
                />
              </div>
              <a
                href={`upi://pay?pa=${encodeURIComponent(process.env.NEXT_PUBLIC_UPI_ID || "")}&pn=${encodeURIComponent(process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "VCHUKI")}&am=${confirmedTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`VCHUKI Order ${orderId.slice(-8).toUpperCase()}`)}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity"
              >
                <Smartphone className="h-3.5 w-3.5" /> Pay ₹{confirmedTotal.toLocaleString()} via UPI App
              </a>
              <p className="text-[10px] text-muted-foreground text-center">We&apos;ll confirm your order once payment is received — usually within a few hours.</p>
            </div>
          )}

          {/* What happens next */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium">What happens next</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${paymentMethod === "upi" ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                  {paymentMethod === "upi" ? <Clock className="h-3 w-3 text-amber-600" /> : <Check className="h-3 w-3 text-emerald-600" />}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{paymentMethod === "upi" ? "Awaiting Payment" : "Order Placed"}</p>
                  <p className="text-[10px] text-muted-foreground">{paymentMethod === "upi" ? "Complete the UPI payment above to confirm" : "We've received your order"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${paymentMethod === "upi" ? "bg-muted" : "bg-[#c4956a]/10"}`}>
                  <Package className={`h-3 w-3 ${paymentMethod === "upi" ? "text-muted-foreground" : "text-[#c4956a]"}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Packaging</p>
                  <p className="text-[10px] text-muted-foreground">{paymentMethod === "upi" ? "Starts once payment is confirmed" : "Your shirt will be carefully packed within 24h"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${paymentMethod === "upi" ? "bg-muted" : "bg-blue-500/10"}`}>
                  <Truck className={`h-3 w-3 ${paymentMethod === "upi" ? "text-muted-foreground" : "text-blue-500"}`} />
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

                {session && savedAddresses.length > 0 && !showNewAddressForm ? (
                  <div className="space-y-2">
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr._id}
                        className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                          selectedAddressId === addr._id ? "border-[#c4956a] bg-[#c4956a]/5" : "border-border hover:border-[#c4956a]/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressId === addr._id}
                          onChange={() => selectSavedAddress(addr)}
                          className="mt-1 accent-[#c4956a]"
                        />
                        <div className="text-sm flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{addr.name}</span>
                            {addr.isDefault && (
                              <span className="text-[9px] uppercase tracking-wider text-[#c4956a] font-medium border border-[#c4956a]/30 px-1.5 py-0.5">Default</span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
                        </div>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => { setShowNewAddressForm(true); setSelectedAddressId("") }}
                      className="text-xs text-[#c4956a] font-medium hover:underline"
                    >
                      + Add a new address
                    </button>
                  </div>
                ) : (
                  <>
                    {session && savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-xs text-muted-foreground hover:text-foreground mb-3"
                      >
                        ← Choose a saved address
                      </button>
                    )}
                    <AddressForm value={form} onChange={(v) => setForm((prev) => ({ ...prev, ...v }))} showPhone={false} />
                  </>
                )}
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
                  <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${paymentMethod === "upi" ? "border-[#c4956a] bg-[#c4956a]/5" : "border-border hover:border-[#c4956a]/30"}`}>
                    <input type="radio" name="payment" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="accent-[#c4956a]" />
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">UPI / Google Pay</span>
                      <p className="text-[10px] text-muted-foreground">Scan QR or pay via your UPI app</p>
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

              {isRecaptchaEnabled() && (
                <p className="text-[9px] text-muted-foreground/60 text-center">
                  This site is protected by reCAPTCHA and the Google{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a> and{" "}
                  <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms of Service</a> apply.
                </p>
              )}

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

            {/* Coupon */}
            <div className="border-t border-border mt-4 pt-4">
              {!couponCode ? (
                <div>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        className="w-full pl-9 pr-3 py-2.5 border border-border bg-background text-xs font-mono uppercase focus:outline-none focus:border-[#c4956a]/50 text-foreground placeholder:text-muted-foreground/50 placeholder:normal-case"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput || applyingCoupon}
                      className="px-4 py-2.5 border border-[#c4956a]/30 text-[10px] font-medium uppercase tracking-wider text-[#c4956a] hover:bg-[#c4956a]/5 disabled:opacity-40 transition-colors"
                    >
                      {applyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-red-500 mt-1.5">{couponError}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{couponCode} applied — ₹{discount} off</span>
                  </div>
                  <button type="button" onClick={handleRemoveCoupon} className="text-[10px] text-muted-foreground hover:text-red-500 transition-colors">Remove</button>
                </div>
              )}
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
