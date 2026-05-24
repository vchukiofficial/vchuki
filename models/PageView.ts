import mongoose, { Schema } from "mongoose"

const PageViewSchema = new Schema({
  path: { type: String, required: true },
  referrer: String,
  userAgent: String,
  device: { type: String, enum: ["mobile", "desktop", "tablet"], default: "desktop" },
  sessionId: String,
  userId: Schema.Types.ObjectId,
  ip: String,
  country: String,
  city: String,
  duration: Number, // seconds spent on page
}, { timestamps: true })

PageViewSchema.index({ createdAt: -1 })
PageViewSchema.index({ path: 1, createdAt: -1 })
PageViewSchema.index({ sessionId: 1 })

export default mongoose.models.PageView || mongoose.model("PageView", PageViewSchema)
