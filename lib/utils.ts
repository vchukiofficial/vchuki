import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export const getDiscountPrice = (price: number, discountPercent: number) => {
  return Math.round(price * (1 - discountPercent / 100))
}

export const paymentMethodLabel = (method: string) => {
  switch (method) {
    case "cod": return "Cash on Delivery"
    case "upi": return "UPI / Google Pay"
    case "razorpay": return "Razorpay"
    case "stripe": return "Stripe"
    default: return method
  }
}
