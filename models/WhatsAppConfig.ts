import mongoose, { Schema, Document } from 'mongoose'

export interface IWhatsAppTemplate {
  name: string
  language: string
  category: 'marketing' | 'utility' | 'authentication'
  status: 'active' | 'inactive' | 'pending' | 'rejected'
  headerType: 'text' | 'image' | 'video' | 'document' | 'none'
  headerContent?: string
  body: string
  footer?: string
  buttons?: { type: 'url' | 'phone' | 'quick_reply'; text: string; value?: string }[]
  variables?: string[]
  createdAt?: Date
}

export interface IWhatsAppFlow {
  name: string
  trigger: 'welcome' | 'abandoned_cart' | 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'review_request' | 'promotion' | 'custom'
  templateName: string
  isActive: boolean
  delay?: number // minutes after trigger
  conditions?: Record<string, any>
}

export interface IWhatsAppConfig extends Document {
  businessId: string
  phoneNumberId: string
  accessToken: string
  webhookVerifyToken: string
  webhookUrl: string
  isActive: boolean
  businessName: string
  templates: IWhatsAppTemplate[]
  flows: IWhatsAppFlow[]
  stats: {
    messagesSent: number
    messagesDelivered: number
    messagesRead: number
    templatesSent: number
  }
}

const WhatsAppTemplateSchema = new Schema({
  name: { type: String, required: true },
  language: { type: String, default: 'en' },
  category: { type: String, enum: ['marketing', 'utility', 'authentication'], default: 'marketing' },
  status: { type: String, enum: ['active', 'inactive', 'pending', 'rejected'], default: 'pending' },
  headerType: { type: String, enum: ['text', 'image', 'video', 'document', 'none'], default: 'none' },
  headerContent: String,
  body: { type: String, required: true },
  footer: String,
  buttons: [{ type: { type: String }, text: String, value: String }],
  variables: [String],
}, { timestamps: true })

const WhatsAppFlowSchema = new Schema({
  name: { type: String, required: true },
  trigger: { type: String, enum: ['welcome', 'abandoned_cart', 'order_confirmed', 'order_shipped', 'order_delivered', 'review_request', 'promotion', 'custom'], required: true },
  templateName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  delay: { type: Number, default: 0 },
  conditions: Schema.Types.Mixed,
})

const WhatsAppConfigSchema = new Schema({
  businessId: { type: String, default: '' },
  phoneNumberId: { type: String, default: '' },
  accessToken: { type: String, default: '' },
  webhookVerifyToken: { type: String, default: '' },
  webhookUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: false },
  businessName: { type: String, default: 'VCHUKI' },
  templates: [WhatsAppTemplateSchema],
  flows: [WhatsAppFlowSchema],
  stats: {
    messagesSent: { type: Number, default: 0 },
    messagesDelivered: { type: Number, default: 0 },
    messagesRead: { type: Number, default: 0 },
    templatesSent: { type: Number, default: 0 },
  },
}, { timestamps: true })

export default mongoose.models.WhatsAppConfig || mongoose.model<IWhatsAppConfig>('WhatsAppConfig', WhatsAppConfigSchema)
