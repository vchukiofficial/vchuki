import mongoose, { Schema, Document } from 'mongoose'

export interface IOrderItem {
  product: Schema.Types.ObjectId
  variant: Schema.Types.ObjectId
  name: string
  price: number
  quantity: number
  size: string
  color: string
}

export interface IOrder extends Document {
  user?: Schema.Types.ObjectId
  guestEmail?: string
  guestPhone?: string
  items: IOrderItem[]
  totalAmount: number
  discountAmount: number
  finalAmount: number
  couponCode?: string
  couponDiscount?: number
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    phone: string
  }
  paymentMethod: 'razorpay' | 'stripe' | 'cod'
  paymentStatus: 'pending' | 'paid' | 'failed'
  paymentId?: string
  shippingStatus: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  timeline: {
    event: string
    timestamp: Date
  }[]
}

const OrderSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  guestEmail: String,
  guestPhone: String,
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String,
  }],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  couponCode: String,
  couponDiscount: Number,
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
  },
  paymentMethod: { type: String, enum: ['razorpay', 'stripe', 'cod'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentId: String,
  shippingStatus: { type: String, enum: ['pending', 'confirmed', 'packaging', 'dispatched', 'shipped', 'out_for_delivery', 'delivered', 'returned', 'cancelled'], default: 'pending' },
  courier: String,
  awb: String,
  estimatedDelivery: Date,
  timeline: [{
    event: String,
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true })

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
