import Razorpay from 'razorpay'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
})

export async function createRazorpayOrder(amount: number, currency = 'INR', receipt = 'receipt#1') {
  const options = {
    amount: amount * 100, // paise
    currency,
    receipt,
  }

  const order = await razorpay.orders.create(options)
  return order
}

export function verifyRazorpaySignature(payload: string, signature: string) {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET!)
    .update(payload)
    .digest('hex')

  return signature === expectedSignature
}
