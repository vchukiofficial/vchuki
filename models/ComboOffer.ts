import mongoose, { Schema, Document } from 'mongoose'

export interface IComboOffer extends Document {
  title: string
  description: string
  discount: number
  categories: string[]
  sizeGroup: 'S/M/L' | 'XL/XXL' | 'all'
  minQty: number
  isActive: boolean
  validFrom: Date
  validTo: Date
}

const ComboOfferSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  discount: { type: Number, required: true },
  categories: [{ type: String, required: true }],
  sizeGroup: { type: String, enum: ['S/M/L', 'XL/XXL', 'all'], default: 'all' },
  minQty: { type: Number, default: 2 },
  isActive: { type: Boolean, default: true },
  validFrom: { type: Date, default: Date.now },
  validTo: { type: Date, required: true },
}, { timestamps: true })

export default mongoose.models.ComboOffer || mongoose.model<IComboOffer>('ComboOffer', ComboOfferSchema)
