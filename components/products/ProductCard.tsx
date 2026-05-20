"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product, ProductVariant } from '@/types'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { motion } from 'framer-motion'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem)
  const toggleWishlist = useWishlistStore((state) => state.toggleItem)
  const isInWishlist = useWishlistStore((state) => state.items.includes(product._id))

  const handleQuickAdd = () => {
    addToCart({
      ...product,
      quantity: 1,
      price: product.basePrice,
      sku: product._id,
      variantId: product.variants?.[0]?._id || '',
      variant: product.variants?.[0] ?? {} as ProductVariant,
    })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl bg-card hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 border cursor-pointer"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-80 overflow-hidden bg-muted">
          <Image 
            src={product.images[0] || '/placeholder-shirt.jpg'} 
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {product.isBestSeller && (
            <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground shadow-lg">
              Best Seller
            </Badge>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">({product.reviewsCount})</span>
          </div>
          
          <h3 className="font-bold text-lg leading-tight mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-2xl font-black text-primary">
              ₹{product.basePrice.toLocaleString()}
            </div>
            <div className="flex -space-x-2">
              <Button
                size="sm"
                className="h-10 w-10 rounded-full p-0 bg-primary hover:bg-primary/90 shadow-lg"
                onClick={(e) => {
                  e.preventDefault()
                  handleQuickAdd()
                }}
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="h-10 w-10 rounded-full bg-card border-2 border-muted hover:border-destructive hover:bg-destructive/10 transition-all duration-200 p-0 shadow-lg"
                onClick={(e) => {
                  e.preventDefault()
                  toggleWishlist(product._id)
                }}
              >
                <Heart 
                  className={`h-5 w-5 transition-colors ${isInWishlist ? 'fill-destructive text-destructive' : 'text-muted-foreground hover:text-destructive'}`} 
                />
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

