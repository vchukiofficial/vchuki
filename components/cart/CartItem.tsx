"use client"

import { useCartStore } from '@/store/cartStore'
import type { CartItem as CartItemType } from '@/types'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex gap-4 py-2">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.variant?.color?.name} / {item.variant?.size}
        </p>
        <p className="text-sm font-semibold mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center text-sm">{item.quantity}</span>
        <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
          <Plus className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => removeItem(item._id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
