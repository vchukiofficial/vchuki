"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, RotateCcw, X, Send } from "lucide-react"

interface Order {
  _id: string
  finalAmount: number
  paymentStatus: string
  paymentMethod: string
  shippingStatus: string
  shippingAddress: { name: string; street: string; city: string; state: string; zip: string; phone: string }
  items: { name: string; quantity: number; size: string; color: string; price: number }[]
  timeline: { event: string; timestamp: string }[]
  createdAt: string
}

const statusSteps = ["pending", "shipped", "delivered"]

// Simulated delivery partner info
function getDeliveryPartner(status: string) {
  if (status === "pending") return null
  return {
    name: "Delhivery",
    awb: "DL" + Math.random().toString(36).substring(2, 10).toUpperCase(),
    eta: status === "shipped" ? "2-3 days" : "Delivered",
    phone: "+91 1800-123-6400",
  }
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [returnModal, setReturnModal] = useState<Order | null>(null)
  const [returnReason, setReturnReason] = useState("")
  const [returnImages, setReturnImages] = useState<File[]>([])
  const [returnSubmitting, setReturnSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    if (session) fetchOrders()
  }, [session])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  function fetchOrders() {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  if (loading) return <div className="container py-20 text-center text-muted-foreground text-sm">Loading orders...</div>

  function getStatusIcon(status: string) {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-amber-500" />
      case "shipped": return <Truck className="h-4 w-4 text-blue-500" />
      case "delivered": return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "cancelled": return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Package className="h-4 w-4" />
    }
  }

  function getStepIndex(status: string) {
    if (status === "cancelled") return -1
    return statusSteps.indexOf(status)
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-xl font-medium tracking-tight text-foreground mb-1">My Orders</h1>
      <p className="text-xs text-muted-foreground mb-6">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>

      {orders.length === 0 ? (
        <div className="text-center py-16 border border-border">
          <Package className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No orders yet.</p>
          <a href="/shirts" className="text-xs text-[#c4956a] mt-2 inline-block hover:underline">Start shopping →</a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order._id
            const currentStep = getStepIndex(order.shippingStatus)
            const delivery = getDeliveryPartner(order.shippingStatus)

            return (
              <div key={order._id} className="border border-border overflow-hidden hover:border-[#c4956a]/20 transition-colors">
                {/* Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.shippingStatus)}
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium ${
                      order.shippingStatus === "delivered" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                      order.shippingStatus === "shipped" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                      order.shippingStatus === "cancelled" ? "bg-red-500/10 text-red-500" :
                      "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {order.shippingStatus}
                    </span>
                    <span className="text-sm font-semibold text-foreground">₹{order.finalAmount.toLocaleString()}</span>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-5 bg-card/30">
                    {/* Progress Bar */}
                    {order.shippingStatus !== "cancelled" && (
                      <div>
                        <div className="flex items-center gap-1">
                          {statusSteps.map((step, i) => (
                            <div key={step} className="flex-1 flex items-center">
                              <div className={`h-1.5 flex-1 ${i <= currentStep ? "bg-[#c4956a]" : "bg-border"}`} />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-[9px] text-muted-foreground capitalize mt-1.5">
                          {statusSteps.map((step) => <span key={step}>{step}</span>)}
                        </div>
                      </div>
                    )}

                    {/* Delivery Partner Info */}
                    {delivery && (
                      <div className="p-3 border border-[#c4956a]/15 bg-[#c4956a]/5">
                        <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-2">Delivery Partner</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{delivery.name}</p>
                            <p className="text-[10px] text-muted-foreground">AWB: <span className="font-mono text-foreground">{delivery.awb}</span></p>
                            <p className="text-[10px] text-muted-foreground">ETA: {delivery.eta}</p>
                          </div>
                          <a href={`tel:${delivery.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium text-foreground hover:border-[#c4956a]/30 transition-colors">
                            <Phone className="h-3 w-3" /> Contact
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Items</p>
                      <div className="space-y-1.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-foreground">{item.name} <span className="text-muted-foreground text-xs">({item.size}/{item.color}) ×{item.quantity}</span></span>
                            <span className="font-medium text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Shipping to</p>
                        <p className="text-sm text-foreground">{order.shippingAddress?.name}</p>
                        <p className="text-xs text-muted-foreground">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zip}</p>
                        {order.shippingAddress?.phone && <p className="text-xs text-muted-foreground">{order.shippingAddress.phone}</p>}
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="flex justify-between text-sm border-t border-border pt-3">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="text-foreground capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"} — <span className={order.paymentStatus === "paid" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}>{order.paymentStatus}</span></span>
                    </div>

                    {/* Return Button */}
                    {order.shippingStatus === "delivered" && (
                      <button
                        onClick={() => { setReturnModal(order); setReturnReason(""); setReturnImages([]) }}
                        className="w-full flex items-center justify-center gap-2 py-3 border border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Request Return / Exchange
                      </button>
                    )}

                    {/* Timeline */}
                    {order.timeline && order.timeline.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Tracking Timeline</p>
                        <div className="space-y-2.5 pl-3 border-l-2 border-[#c4956a]/20">
                          {order.timeline.map((event, i) => (
                            <div key={i} className="relative">
                              <div className="absolute -left-[17px] top-1 h-2.5 w-2.5 rounded-full bg-[#c4956a] border-2 border-background" />
                              <div className="pl-3">
                                <p className="text-sm text-foreground">{event.event}</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(event.timestamp).toLocaleString("en-IN")}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Return Request Modal */}
      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !returnSubmitting && setReturnModal(null)} />
          <div className="relative w-full max-w-md bg-background border border-border shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-[#c4956a]" />
                <h2 className="text-sm font-medium text-foreground">Request Return</h2>
              </div>
              <button onClick={() => setReturnModal(null)} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-3 bg-muted/50 border border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Order</p>
                <p className="text-sm font-medium text-foreground mt-0.5">#{returnModal._id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground mt-1">{returnModal.items.map(i => `${i.name} (${i.size}/${i.color})`).join(", ")}</p>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Reason for Return *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full mt-1.5 px-3 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50"
                >
                  <option value="">Select a reason</option>
                  <option value="Size doesn't fit">Size doesn&apos;t fit</option>
                  <option value="Color different from image">Color different from image</option>
                  <option value="Quality not as expected">Quality not as expected</option>
                  <option value="Received damaged product">Received damaged product</option>
                  <option value="Wrong product received">Wrong product received</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Upload Product Images */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Upload Product Photos (2-3 required) *</label>
                <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">Clear photos showing the product, issue, and attached tag.</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files
                    if (files && files.length > 0) {
                      setReturnImages(Array.from(files).slice(0, 5))
                    }
                  }}
                  className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:border file:border-border file:bg-muted file:text-foreground file:text-[10px] file:font-medium file:uppercase file:tracking-wider file:cursor-pointer"
                />
                {returnImages.length > 0 && returnImages.length >= 2 && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1.5">{returnImages.length} photo{returnImages.length > 1 ? "s" : ""} selected</p>
                )}
                {returnImages.length > 0 && returnImages.length < 2 && (
                  <p className="text-[10px] text-red-500 mt-1">Please upload at least 2 photos</p>
                )}
              </div>

              <div className="p-3 bg-red-500/5 border border-red-500/20 text-xs text-red-700 dark:text-red-300 space-y-1">
                <p className="font-semibold">Return NOT accepted if:</p>
                <p>- Product tag is removed, torn, or broken</p>
                <p>- Product has been used, washed, or altered</p>
                <p>- Less than 2 product photos uploaded</p>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <p className="font-semibold">Return Policy:</p>
                <p>- Returns accepted within 7 days of delivery</p>
                <p>- Product must be unused with ALL original tags intact</p>
                <p>- 2-3 clear product photos are mandatory</p>
                <p>- Pickup arranged within 2-3 business days</p>
                <p>- Refund processed within 5-7 days after pickup</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <button onClick={() => setReturnModal(null)} disabled={returnSubmitting} className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!returnReason) return
                  setReturnSubmitting(true)
                  try {
                    const res = await fetch("/api/orders/return", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId: returnModal._id, reason: returnReason }),
                    })
                    const data = await res.json()
                    if (res.ok) {
                      setToast({ message: data.message || "Return request submitted!", type: "success" })
                      setReturnModal(null)
                      fetchOrders()
                    } else {
                      setToast({ message: data.error || "Failed to submit return", type: "error" })
                    }
                  } catch {
                    setToast({ message: "Something went wrong", type: "error" })
                  }
                  setReturnSubmitting(false)
                }}
                disabled={!returnReason || returnImages.length < 2 || returnSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                {returnSubmitting ? "Submitting..." : "Submit Return"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 border shadow-lg text-xs font-medium animate-in slide-in-from-bottom-2 ${
          toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
