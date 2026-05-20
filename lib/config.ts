import { z } from 'zod'

// Define validation schema
const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Database
  MONGODB_URI: z.string().url(),
  
  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  
  // Payment
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  STRIPE_SECRET_KEY: z.string().optional(),
  
  // Email (optional)
  RESEND_API_KEY: z.string().optional(),
  
  // API
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:3000/api'),
})

// Parsed and validated config
export const config = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  MONGODB_URI: process.env.MONGODB_URI!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET!,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL!,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
})

if (process.env.NODE_ENV === 'production') {
  console.log('✅ Production config loaded successfully')
}

export type ConfigType = typeof config
