import mongoose, { Schema, Document } from 'mongoose'

export interface ICoupon extends Document {
  code: string
  type: 'flat' | 'percentage' | 'bxgy' | 'free_shipping' | 'first_order' | 'category' | 'festival'
  value: number
  maxValue?: number
  minAmount?: number
  validFrom: Date
  validTo: Date
  usageLimit: number
  usedBy: string[]
  categories?: string[]
  isActive: boolean
}

const CouponSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { 
    type: String, 
    enum: ['flat', 'percentage', 'bxgy', 'free_shipping', 'first_order', 'category', 'festival'],
    required: true 
  },
  value: { type: Number, required: true },
  maxValue: Number,
  minAmount: Number,
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  usageLimit: { type: Number, required: true, min: 1 },
  usedBy: [{ type: String }],
  categories: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)
