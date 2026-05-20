"use client"

import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/button'
import { CartItem } from '@/components/cart/CartItem'
import { useUIStore } from '@/store/uiStore'
import Link from 'next/link'
import { X, ShoppingCart } from 'lucide-react'

export default function CartDrawer() {
  const { items, totalItems, clearCart } = useCartStore()
  const { isCartOpen, setCartOpen } = useUIStore()

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
      
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-xl">
        <div className="flex h-14 shrink-0 items-center px-4">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <Button variant="ghost" size="sm" className="ml-auto h-8 w-8 p-0" onClick={() => setCartOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto py-4">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add some shirts to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4 px-4">
              {items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total ({totalItems} items):</span>
              <span>₹{items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}</span>
            </div>
            <Link href="/cart" className="block w-full">
              <Button className="w-full">View Cart & Checkout</Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>
      </aside>
    </div>
  )
}
