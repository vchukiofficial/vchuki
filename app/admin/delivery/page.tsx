"use client"

import { useEffect, useState } from "react"
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Order {
  _id: string
  finalAmount: number
  paymentStatus: string
  paymentMethod: string
  shippingStatus: string
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    phone: string
  }
  createdAt: string
  items: { name: string; quantity: number; size: string; color: string }[]
  timeline: { event: string; timestamp: string }[]
}

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  shipped: { icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
  delivered: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  cancelled: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
}

export default function AdminDeliveryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders || []); setLoading(false) })
  }, [])

  async function updateStatus(id: string, shippingStatus: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingStatus }),
    })
    if (res.ok) {
      setOrders(orders.map((o) => o._id === id ? { ...o, shippingStatus } : o))
      if (selectedOrder?._id === id) {
        setSelectedOrder({ ...selectedOrder, shippingStatus })
      }
    }
  }

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.shippingStatus === filter)

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.shippingStatus === "pending").length,
    shipped: orders.filter((o) => o.shippingStatus === "shipped").length,
    delivered: orders.filter((o) => o.shippingStatus === "delivered").length,
    cancelled: orders.filter((o) => o.shippingStatus === "cancelled").length,
  }

  if (loading) return <div className="text-muted-foreground">Loading delivery data...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Delivery Management</h1>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(["all", "pending", "shipped", "delivered", "cancelled"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm border transition-colors capitalize flex items-center gap-2 ${
              filter === status ? "bg-primary/10 border-primary text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {status} <span className="text-xs opacity-70">({statusCounts[status]})</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.shippingStatus as keyof typeof statusConfig] || statusConfig.pending
            const Icon = config.icon
            return (
              <div
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  selectedOrder?._id === order._id ? "border-primary bg-primary/5" : "border-border/50 bg-card/50 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full ${config.bg} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">#{order._id.slice(-8)}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${config.bg} ${config.color}`}>
                    {order.shippingStatus}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}
                  </span>
                  <span className="text-sm font-medium">₹{order.finalAmount.toLocaleString()}</span>
                </div>
              </div>
            )
          })}
          {filteredOrders.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No orders in this category.</p>
          )}
        </div>

        {/* Order Detail Panel */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="p-4 rounded-lg border border-border/50 bg-card/50 sticky top-20 space-y-4">
              <h3 className="font-bold">Order #{selectedOrder._id.slice(-8)}</h3>

              {/* Shipping Address */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ship To</p>
                <div className="text-sm">
                  <p className="font-medium">{selectedOrder.shippingAddress?.name}</p>
                  <p className="text-muted-foreground">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-muted-foreground">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.zip}</p>
                  <p className="text-muted-foreground">📞 {selectedOrder.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Items</p>
                <div className="space-y-1">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="text-sm flex justify-between">
                      <span>{item.name} <span className="text-muted-foreground">({item.size}/{item.color}) ×{item.quantity}</span></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <span className="capitalize">{selectedOrder.paymentMethod} — <span className={selectedOrder.paymentStatus === "paid" ? "text-green-500" : "text-yellow-500"}>{selectedOrder.paymentStatus}</span></span>
              </div>

              {/* Timeline */}
              {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Timeline</p>
                  <div className="space-y-2">
                    {selectedOrder.timeline.map((event, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>{event.event}</span>
                        <span className="text-muted-foreground ml-auto">{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["pending", "shipped", "delivered", "cancelled"] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedOrder.shippingStatus === status ? "default" : "outline"}
                      className="capitalize text-xs"
                      onClick={() => updateStatus(selectedOrder._id, status)}
                      disabled={selectedOrder.shippingStatus === status}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-lg border border-border/50 bg-card/50 text-center">
              <Package className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
