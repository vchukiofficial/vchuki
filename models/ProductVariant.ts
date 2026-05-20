import mongoose, { Schema, Document } from 'mongoose'

export interface IProductVariant extends Document {
  product: Schema.Types.ObjectId | mongoose.Types.ObjectId
  color: {
    name: string
    hex: string
  }
  size: string
  fabric: string
  fit: 'slim' | 'regular' | 'relaxed'
  stock: number
  priceAdjustment: number // % or flat amount
  sku: string
  images: string[]
}

const ProductVariantSchema: Schema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  color: {
    name: String,
    hex: String,
  },
  size: String,
  fabric: String,
  fit: { type: String, enum: ['slim', 'regular', 'relaxed'] },
  stock: { type: Number, default: 0, min: 0 },
  priceAdjustment: { type: Number, default: 0 },
  sku: { type: String, unique: true, sparse: true },
  images: [String],
}, { timestamps: true })

export default mongoose.model<IProductVariant>('ProductVariant', ProductVariantSchema)
