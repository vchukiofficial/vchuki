import mongoose, { Schema } from 'mongoose'

const HeroVideoSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.models.HeroVideo || mongoose.model('HeroVideo', HeroVideoSchema)
