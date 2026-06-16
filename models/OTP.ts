import mongoose, { Schema, Document } from 'mongoose'

export interface IOTP extends Document {
  email: string
  otp: string
  type: string
  expiresAt: Date
  verified: boolean
}

const OTPSchema: Schema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: true })

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
OTPSchema.index({ email: 1, type: 1 })

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema)
