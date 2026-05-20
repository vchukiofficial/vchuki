import { useState, useCallback } from 'react'

export function useVariant() {
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  const selectVariant = useCallback((variant: any) => {
    setSelectedVariant(variant)
  }, [])

  const updateStock = (stock: number) => {
    // Update based on variant stock
    return stock > 0
  }

  return {
    selectedVariant,
    selectVariant,
    updateStock,
  }
}
