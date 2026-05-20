import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  role: 'user' | 'admin'
  addresses: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    phone: string
  }[]
  wishlist: string[] // product IDs
  resetPasswordToken?: string
  resetPasswordExpire?: Date
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: [{
    name: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
  }],
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password as string, salt)
  next()
})

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password as string)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
