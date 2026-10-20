import { Metadata } from "next"
import Link from "next/link"
import { BUSINESS } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Return & Exchange Policy — VCHUKI",
  description: "VCHUKI's return and exchange policy. 7-day returns with conditions. Learn about eligibility, refund process, and exchange options.",
  alternates: { canonical: "https://vchuki.com/refund-policy" },
}

export default function RefundPolicyPage() {
  return (
    <div className="container py-8 md:py-16 max-w-3xl">
      <nav className="text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">Return & Exchange Policy</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-2">Return & Exchange Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: October 20, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:leading-relaxed">

        <h2>The short version</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Wrong size? Free size exchange</strong> within 7 days of delivery, subject to stock.</li>
          <li><strong>Returns</strong> are accepted within <strong>7 days</strong> of delivery for unworn, unwashed items with tags attached.</li>
          <li>Your <strong>first return is free</strong>. After that, a reverse pickup fee of ₹25 per item applies (maximum ₹100 per order).</li>
          <li>Received something <strong>damaged, defective or wrong</strong>? Tell us within 48 hours with a photo and we&apos;ll replace it free.</li>
          <li>Combo and bundle orders can be <strong>exchanged for a different size</strong>; returns on bundles must include every item in the bundle.</li>
        </ul>

        <h2>Refunds</h2>
        <p>Prepaid (UPI) orders are refunded to the original payment method. Cash on Delivery orders are refunded to a UPI ID of your choice, or as instant store credit if you prefer.</p>

        <h2>Conditions for Return Eligibility</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Product is <strong>unused, unwashed and unaltered</strong>, with original tags attached</li>
          <li>Request raised within 7 days of delivery, with 2–3 clear photos (front, back and tag)</li>
          <li>Original packaging included where possible</li>
        </ul>

        <h2>Not Eligible for Return</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Products that have been worn, washed, ironed or altered</li>
          <li>Products with tags removed or damaged</li>
          <li>Requests raised more than 7 days after delivery</li>
          <li>Products with customer-caused damage (stains, tears, etc.)</li>
        </ul>

        <h2>Exchange Process</h2>
        <p>We offer exchanges for size or color changes subject to stock availability. To initiate an exchange:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>WhatsApp us at {BUSINESS.phone} or email {BUSINESS.email.support} with your order number</li>
          <li>Our team will confirm availability within 24 hours</li>
          <li>A pickup will be scheduled at your address</li>
          <li>Replacement will be shipped after receiving the original item</li>
        </ol>

        <h2>Refund Timelines</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>UPI/Wallet:</strong> 3-5 business days</li>
          <li><strong>Credit/Debit Card:</strong> 7-10 business days</li>
          <li><strong>Net Banking:</strong> 7-10 business days</li>
          <li><strong>COD orders:</strong> Store credit (instant) or UPI refund (3-5 business days)</li>
        </ul>
        <p className="text-xs">Note: Refund is processed only after the returned product passes our quality inspection. If the product fails inspection (worn, damaged, <strong>tags removed/broken</strong>), the return will be rejected and the product shipped back to you at your cost.</p>

        <h2>Cancellation Policy</h2>
        <p>Orders can be cancelled within 1 hour of placement. Once the order enters processing or shipping, cancellation is not possible. You may return after delivery as per the return policy above.</p>

        <h2>Contact for Returns</h2>
        <p>Email: {BUSINESS.email.support}<br/>Phone: {BUSINESS.phone}<br/>Hours: {BUSINESS.hours}</p>
        <p className="text-xs">VCHUKI reserves the right to refuse returns that do not meet the above criteria. Repeated misuse of the return policy may result in account restrictions.</p>
      </div>
    </div>
  )
}
