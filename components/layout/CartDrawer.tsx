"use client"

import { useCartStore } from "@/store/cartStore"
import { useUIStore } from "@/store/uiStore"
import { X, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

export default function CartDrawer() {
  const { items, removeItem, updateQuantity } = useCartStore()
  const { isCartOpen, setCartOpen } = useUIStore()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-[#c4956a]/15 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-[#c4956a]/15">
              <div>
                <h2 className="text-base font-semibold tracking-wide">Your Bag</h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">{items.length} {items.length === 1 ? "item" : "items"}</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="h-8 w-8 rounded-full border border-border/50 flex items-center justify-center hover:border-[#c4956a]/30 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-[#c4956a]/5 border border-[#c4956a]/15 flex items-center justify-center mb-4">
                    <ShoppingCart className="h-7 w-7 text-[#c4956a]/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">Your bag is empty</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Add premium shirts to get started</p>
                  <button onClick={() => setCartOpen(false)} className="mt-5 px-5 py-2.5 border border-[#c4956a]/30 text-xs font-medium tracking-wider uppercase hover:bg-[#c4956a]/5 transition-colors">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item._id + item.sku} className="flex gap-3 p-3 border border-border/50 hover:border-[#c4956a]/20 transition-colors">
                      <div className="relative h-20 w-16 overflow-hidden bg-secondary flex-shrink-0">
                        <Image src={item.images?.[0] || "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.size} / {item.color}</p>
                        <p className="text-sm font-bold text-[#c4956a] mt-1">₹{item.price.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="h-6 w-6 border border-border/50 flex items-center justify-center hover:border-[#c4956a]/30 transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs w-5 text-center font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="h-6 w-6 border border-border/50 flex items-center justify-center hover:border-[#c4956a]/30 transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                          <button onClick={() => removeItem(item._id)} className="ml-auto text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t border-[#c4956a]/15 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Free shipping on orders above ₹1,599</p>
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="block w-full py-3.5 bg-[#2a1f14] text-[#f5e6d3] text-center text-xs font-medium tracking-wider uppercase hover:bg-[#1a1209] transition-colors">
                  Checkout
                </Link>
                <Link href="/cart" onClick={() => setCartOpen(false)} className="block w-full py-3 border border-[#c4956a]/30 text-center text-xs font-medium tracking-wider uppercase hover:bg-[#c4956a]/5 transition-colors">
                  View Full Bag
                </Link>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
