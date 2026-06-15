import mongoose, { Schema, Document } from 'mongoose'

export interface IEmailTemplate extends Document {
  slug: string
  name: string
  subject: string
  body: string
  variables: string[]
  isActive: boolean
}

const EmailTemplateSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  variables: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.EmailTemplate || mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema)
