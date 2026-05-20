import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
  product: Schema.Types.ObjectId
  user: Schema.Types.ObjectId
  rating: number
  comment?: string
  images?: string[]
  verifiedPurchase: boolean
}

const ReviewSchema: Schema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  images: [String],
  verifiedPurchase: { type: Boolean, default: false },
}, { timestamps: true })

ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

export default mongoose.model<IReview>('Review', ReviewSchema)
