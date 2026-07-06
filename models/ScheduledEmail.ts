import mongoose, { Schema, Document } from 'mongoose'

export interface IScheduledEmail extends Document {
  recipientType: 'custom' | 'waitlist'
  to: string
  subject: string
  heading: string
  content: string
  bannerImageUrl: string
  productIds: string[]
  ctaText: string
  ctaLink: string
  scheduledAt: Date
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  sentCount: number
  error?: string
  createdBy: string
}

const ScheduledEmailSchema: Schema = new Schema({
  recipientType: { type: String, enum: ['custom', 'waitlist'], default: 'custom' },
  to: { type: String, default: '' },
  subject: { type: String, required: true },
  heading: { type: String, required: true },
  content: { type: String, required: true },
  bannerImageUrl: { type: String, default: '' },
  productIds: [{ type: String }],
  ctaText: { type: String, default: 'Shop Now' },
  ctaLink: { type: String, default: 'https://vchuki.com/shirts' },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed', 'cancelled'], default: 'pending' },
  sentCount: { type: Number, default: 0 },
  error: String,
  createdBy: { type: String, default: '' },
}, { timestamps: true })

ScheduledEmailSchema.index({ status: 1, scheduledAt: 1 })

export default mongoose.models.ScheduledEmail || mongoose.model<IScheduledEmail>('ScheduledEmail', ScheduledEmailSchema)
