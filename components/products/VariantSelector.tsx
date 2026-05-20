"use client"

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useVariant } from '@/hooks/useVariant'
import type { ProductVariant } from '@/types'
import { cn, formatCurrency } from '@/lib/utils'

interface VariantSelectorProps {
  variants: ProductVariant[]
  basePrice: number
  onVariantChange: (variant: ProductVariant | null) => void
}

export default function VariantSelector({ variants, basePrice, onVariantChange }: VariantSelectorProps) {
  const { selectedVariant, selectVariant } = useVariant()
  const [availableSizes, setAvailableSizes] = useState<string[]>([])

  useEffect(() => {
    if (variants.length > 0) {
      selectVariant(variants[0])
    }
  }, [variants, selectVariant])

  const handleColorChange = (colorName: string) => {
    const colorVariants = variants.filter(v => v.color.name.toLowerCase() === colorName.toLowerCase())
    if (colorVariants.length > 0) {
      selectVariant(colorVariants[0])
    }
  }

  const handleSizeChange = (size: string) => {
    const sizeVariant = variants.find(v => 
      v.size === size && 
      v._id === selectedVariant?._id
    )
    if (sizeVariant) {
      selectVariant(sizeVariant)
    }
  }

  useEffect(() => {
    onVariantChange(selectedVariant || null)
  }, [selectedVariant, onVariantChange])

  useEffect(() => {
    setAvailableSizes(Array.from(new Set(variants.map(v => v.size))))
  }, [variants])

  if (!variants.length) return null

  return (
    <div className="space-y-6">
      {/* Color Swatches */}
      <div>
        <Label>Color</Label>
        <div className="flex gap-2 mt-2">
          {Array.from(new Set(variants.map(v => v.color.name))).map((colorName) => {
            const color = variants.find(v => v.color.name === colorName)!.color
            return (
            <button
              key={colorName}
              onClick={() => handleColorChange(color.name)}
              className={cn(
                'h-12 w-12 rounded-lg border-2 shadow-md transition-all hover:scale-105 hover:shadow-primary/25',
                selectedVariant?.color.name === color.name
                  ? 'border-primary ring-2 ring-primary/50 scale-105 shadow-primary/50'
                  : 'border-border hover:border-primary/50'
              )}
              style={{ backgroundColor: color.hex }}
              aria-label={color.name}
            />
            )
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div>
        <Label className="mb-2 block">Size</Label>
        <Select onValueChange={handleSizeChange} value={selectedVariant?.size || ''}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {availableSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stock & Price */}
      {selectedVariant && (
        <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Stock:</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              selectedVariant.stock > 10 ? 'bg-emerald-100 text-emerald-800' 
              : selectedVariant.stock > 0 ? 'bg-amber-100 text-amber-800' 
              : 'bg-destructive text-destructive-foreground'
            }`}>
              {selectedVariant.stock > 0 ? `${selectedVariant.stock} left` : 'Out of stock'}
            </span>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {formatCurrency((selectedVariant.priceAdjustment))}
            </span>
            {selectedVariant.priceAdjustment > 0 && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(basePrice)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

