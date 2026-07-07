import mongoose, { Schema, Document } from 'mongoose'


export interface IBlog extends Document {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags: string[]
  author: string
  readTime: string
  isPublished: boolean
  isFeatured: boolean
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  relatedProducts: string[]
  createdAt: Date
  updatedAt: Date
}



const BlogSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  category: { type: String, required: true },
  tags: [String],
  author: { type: String, default: 'VCHUKI Team' },
  readTime: { type: String, default: '5 min' },
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: [String],
  relatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true })

BlogSchema.index({ slug: 1 })
BlogSchema.index({ isPublished: 1, createdAt: -1 })
BlogSchema.index({ category: 1 })
BlogSchema.index({ tags: 1 })

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema)
