import mongoose, { Schema, Document } from 'mongoose'

export interface ILead extends Document {
  name?: string
  instagramHandle?: string
  phone?: string
  email?: string
  source: 'instagram_comment' | 'instagram_dm' | 'website' | 'whatsapp' | 'store' | 'other'
  sourceDetail?: string
  permalink?: string
  commentId?: string
  commentText?: string
  commentAt?: Date
  dmWindowExpiresAt?: Date
  interestedInText?: string
  notes?: string
  stage: 'new' | 'contacted' | 'interested' | 'converted' | 'lost'
  lastContactedAt?: Date
}

const LeadSchema: Schema = new Schema({
  name: String,
  instagramHandle: { type: String, lowercase: true, trim: true, index: true },
  phone: { type: String, trim: true, index: true },
  email: { type: String, lowercase: true, trim: true, index: true },
  source: { type: String, enum: ['instagram_comment', 'instagram_dm', 'website', 'whatsapp', 'store', 'other'], default: 'website' },
  sourceDetail: String,
  permalink: String,
  // One lead per Instagram comment — lets the daily pulse re-run without duplicates
  commentId: { type: String, unique: true, sparse: true },
  commentText: String,
  commentAt: Date,
  dmWindowExpiresAt: Date,
  interestedInText: String,
  notes: String,
  stage: { type: String, enum: ['new', 'contacted', 'interested', 'converted', 'lost'], default: 'new', index: true },
  lastContactedAt: Date,
}, { timestamps: true })

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema)
