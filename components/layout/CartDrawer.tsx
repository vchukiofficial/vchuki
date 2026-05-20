"use client"

import { useCartStore } from "@/store/cartStore"
import { useUIStore } from "@/store/uiStore"
import { Button } from "@/components/ui/button"
import { X, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CartDrawer() {
  const { items, removeItem, updateQuantity } = useCartStore()
  const { isCartOpen, setCartOpen } = useUIStore()

  if (!isCartOpen) return null

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border/50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="text-lg font-bold">Cart ({items.length})</h2>
          <Button variant="ghost" size="icon" onClick={() => setCartOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">Your cart is empty</p>
              <Button variant="outline" className="mt-4" onClick={() => setCartOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item._id + item.sku} className="flex gap-3 p-3 rounded-lg bg-card border border-border/50">
                  <div className="relative h-20 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image src={item.images?.[0] || "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.size} / {item.color}</p>
                    <p className="text-sm font-bold text-primary mt-1">₹{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="h-6 w-6 rounded bg-secondary flex items-center justify-center">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="h-6 w-6 rounded bg-secondary flex items-center justify-center">
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => removeItem(item._id)} className="ml-auto text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border/50 space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Subtotal</span>
              <span className="text-primary">₹{subtotal.toLocaleString()}</span>
            </div>
            <Link href="/checkout" onClick={() => setCartOpen(false)}>
              <Button className="w-full">Checkout</Button>
            </Link>
            <Link href="/cart" onClick={() => setCartOpen(false)}>
              <Button variant="outline" className="w-full mt-2">View Full Cart</Button>
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}
