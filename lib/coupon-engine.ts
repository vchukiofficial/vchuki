export interface Coupon {
  code: string
  type: 'flat' | 'percentage' | 'bxgy' | 'free_shipping' | 'first_order'
  value: number
  maxValue?: number // for percentage
  minAmount?: number
  validFrom: Date
  validTo: Date
  usageLimit: number
  usedBy: string[]
  categories?: string[]
}

export function validateCoupon(coupon: Coupon, cartTotal: number, userId?: string, categories: string[] = []) {
  const now = new Date()
  
  if (now < coupon.validFrom || now > coupon.validTo) return { valid: false, reason: 'expired' }
  if (coupon.usedBy.length >= coupon.usageLimit) return { valid: false, reason: 'limit_reached' }
  if (coupon.minAmount && cartTotal < coupon.minAmount) return { valid: false, reason: 'min_amount' }
  
  if (coupon.categories && !categories.some(cat => coupon.categories!.includes(cat))) {
    return { valid: false, reason: 'category_mismatch' }
  }
  
  if (coupon.type === 'first_order' && userId && coupon.usedBy.includes(userId)) {
    return { valid: false, reason: 'already_used' }
  }

  return { valid: true, discountValue: coupon.value }
}

export function calculateDiscount(coupon: Coupon, cartTotal: number) {
  let discount = 0

  switch (coupon.type) {
    case 'flat':
      discount = coupon.value
      break
    case 'percentage':
      discount = Math.min(coupon.value / 100 * cartTotal, coupon.maxValue || Infinity)
      break
    case 'bxgy':
      // Simplified: buy 1 get discount on second
      discount = coupon.value
      break
    case 'free_shipping':
      discount = 50 // fixed shipping
      break
  }

  return Math.min(discount, cartTotal * 0.5) // max 50% discount
}
