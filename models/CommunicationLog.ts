import mongoose, { Schema, Document } from 'mongoose'

export interface ICommunicationLog extends Document {
  type: 'otp' | 'order' | 'shipping' | 'welcome' | 'marketing' | 'reset'
  channel: 'email' | 'sms' | 'whatsapp'
  to: string
  subject: string
  status: 'sent' | 'failed'
  metadata: Record<string, any>
  error?: string
}

const CommunicationLogSchema: Schema = new Schema({
  type: { type: String, required: true },
  channel: { type: String, default: 'email' },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  metadata: { type: Schema.Types.Mixed, default: {} },
  error: String,
}, { timestamps: true })

CommunicationLogSchema.index({ createdAt: -1 })

export default mongoose.models.CommunicationLog || mongoose.model<ICommunicationLog>('CommunicationLog', CommunicationLogSchema)
