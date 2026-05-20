import { Metadata } from "next"
import Link from "next/link"
import { BUSINESS } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Terms & Conditions — VCHUKI",
  description: "Read VCHUKI's terms and conditions for using our website and purchasing products. Understand your rights and obligations.",
  alternates: { canonical: "https://vchuki.com/terms-and-conditions" },
}

export default function TermsPage() {
  return (
    <div className="container py-8 md:py-16 max-w-3xl">
      <nav className="text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">Terms & Conditions</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-2">Terms & Conditions</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: May 20, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:leading-relaxed">
        <p>Welcome to {BUSINESS.domain}. These Terms & Conditions govern your use of our website and purchase of products from {BUSINESS.legalName} (GSTIN: {BUSINESS.gstin}).</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using our website, you agree to be bound by these Terms. If you do not agree, please do not use our services.</p>

        <h2>2. Products & Pricing</h2>
        <p>All product prices are listed in Indian Rupees (INR) and include applicable GST. We reserve the right to modify prices without prior notice. Prices at the time of order placement will be honored.</p>
        <p>Product images are for illustration purposes. Actual colors may vary slightly due to screen settings and photography lighting.</p>

        <h2>3. Orders & Payment</h2>
        <p>By placing an order, you confirm that the information provided is accurate. We reserve the right to cancel orders if fraud is suspected, items are out of stock, or pricing errors occur.</p>
        <p>We accept payments via: UPI, Credit/Debit Cards, Net Banking, Wallets, and Cash on Delivery (COD). All online payments are processed through Razorpay&apos;s secure payment gateway.</p>

        <h2>4. Shipping & Delivery</h2>
        <p>Delivery timelines are estimates and may vary based on location and courier availability. VCHUKI is not liable for delays caused by courier partners, natural disasters, or circumstances beyond our control. See our <Link href="/shipping-policy" className="text-primary hover:underline">Shipping Policy</Link> for details.</p>

        <h2>5. Returns & Refunds</h2>
        <p>Products may be returned within 30 days of delivery subject to our <Link href="/refund-policy" className="text-primary hover:underline">Refund & Return Policy</Link>. Items must be unused, unwashed, and in original packaging with tags attached.</p>

        <h2>6. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use. We reserve the right to suspend accounts that violate these terms.</p>

        <h2>7. Intellectual Property</h2>
        <p>All content on this website — including logos, images, text, designs, and trademarks — is the property of {BUSINESS.legalName}. Unauthorized reproduction, distribution, or use is strictly prohibited.</p>

        <h2>8. Limitation of Liability</h2>
        <p>VCHUKI shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the amount paid for the specific product in question.</p>

        <h2>9. Governing Law</h2>
        <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.</p>

        <h2>10. Contact</h2>
        <p>{BUSINESS.legalName}<br/>GSTIN: {BUSINESS.gstin}<br/>Address: {BUSINESS.fullAddress}<br/>Email: {BUSINESS.email.support}<br/>Phone: {BUSINESS.phone}</p>
      </div>
    </div>
  )
}
