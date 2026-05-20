"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react"

interface Order {
  _id: string
  finalAmount: number
  paymentStatus: string
  paymentMethod: string
  shippingStatus: string
  shippingAddress: { name: string; city: string; state: string }
  items: { name: string; quantity: number; size: string; color: string; price: number }[]
  timeline: { event: string; timestamp: string }[]
  createdAt: string
}

const statusSteps = ["pending", "shipped", "delivered"]

export default function OrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => { setOrders(data.orders || []); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [session])

  if (loading) return <div className="container py-20 text-center text-muted-foreground">Loading orders...</div>

  function getStatusIcon(status: string) {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />
      case "shipped": return <Truck className="h-4 w-4 text-blue-500" />
      case "delivered": return <CheckCircle className="h-4 w-4 text-green-500" />
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
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order._id
            const currentStep = getStepIndex(order.shippingStatus)

            return (
              <div key={order._id} className="rounded-lg border border-border/50 bg-card/50 overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.shippingStatus)}
                    <div className="text-left">
                      <p className="text-sm font-medium">Order #{order._id.slice(-8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[10px] capitalize">{order.shippingStatus}</Badge>
                    <span className="text-sm font-bold text-primary">₹{order.finalAmount.toLocaleString()}</span>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border/50 p-4 space-y-4">
                    {/* Progress Bar */}
                    {order.shippingStatus !== "cancelled" && (
                      <div className="flex items-center gap-1">
                        {statusSteps.map((step, i) => (
                          <div key={step} className="flex-1 flex items-center">
                            <div className={`h-2 flex-1 rounded-full ${i <= currentStep ? "bg-primary" : "bg-border"}`} />
                            {i < statusSteps.length - 1 && <div className="w-1" />}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] text-muted-foreground capitalize">
                      {statusSteps.map((step) => <span key={step}>{step}</span>)}
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Items</p>
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>{item.name} <span className="text-muted-foreground">({item.size}/{item.color}) ×{item.quantity}</span></span>
                            <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivering to</span>
                      <span>{order.shippingAddress?.name}, {order.shippingAddress?.city}</span>
                    </div>

                    {/* Payment */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="capitalize">{order.paymentMethod} — <span className={order.paymentStatus === "paid" ? "text-green-500" : "text-yellow-500"}>{order.paymentStatus}</span></span>
                    </div>

                    {/* Timeline */}
                    {order.timeline && order.timeline.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Tracking Timeline</p>
                        <div className="space-y-2 pl-3 border-l-2 border-border/50">
                          {order.timeline.map((event, i) => (
                            <div key={i} className="relative">
                              <div className="absolute -left-[17px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                              <div className="pl-3">
                                <p className="text-sm">{event.event}</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
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
    </div>
  )
}
