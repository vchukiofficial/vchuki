import { Metadata } from "next"
import Link from "next/link"
import { BUSINESS } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Refund & Return Policy — VCHUKI",
  description: "VCHUKI's 30-day easy return and refund policy. Learn about eligibility, exchange process, damaged product handling, and refund timelines.",
  alternates: { canonical: "https://vchuki.com/refund-policy" },
}

export default function RefundPolicyPage() {
  return (
    <div className="container py-8 md:py-16 max-w-3xl">
      <nav className="text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">Refund & Return Policy</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-2">Refund & Return Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">We want you to love your VCHUKI purchase. If not, we make returns easy.</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-semibold [&_p]:leading-relaxed">

        <h2>30-Day Return Window</h2>
        <p>You may return any product within 30 days of delivery. Items must be unused, unwashed, unaltered, and in original packaging with all tags attached.</p>

        <h2>Return Eligibility</h2>
        <p><strong>Eligible for return:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Wrong size received</li>
          <li>Defective or damaged product</li>
          <li>Product different from what was ordered</li>
          <li>Quality not as expected</li>
          <li>Changed your mind (within 30 days, unused)</li>
        </ul>
        <p><strong>NOT eligible for return:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Products worn, washed, or altered</li>
          <li>Products without original tags and packaging</li>
          <li>Products marked as &quot;Final Sale&quot; or &quot;Non-Returnable&quot;</li>
          <li>Innerwear and accessories (hygiene reasons)</li>
        </ul>

        <h2>Exchange Policy</h2>
        <p>We offer free exchanges for size or color changes. Simply initiate a return and place a new order, or contact us at {BUSINESS.email.returns} for a direct exchange.</p>

        <h2>Damaged Products</h2>
        <p>If you receive a damaged or defective product, contact us within 48 hours of delivery with photos. We will arrange a free pickup and send a replacement or full refund at no extra cost.</p>

        <h2>How to Initiate a Return</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Email {BUSINESS.email.returns} with your order number and reason</li>
          <li>Our team will confirm eligibility within 24 hours</li>
          <li>A pickup will be scheduled at your address</li>
          <li>Refund will be processed after quality check</li>
        </ol>

        <h2>Refund Timelines</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>UPI/Wallet:</strong> 2-3 business days</li>
          <li><strong>Credit/Debit Card:</strong> 5-7 business days</li>
          <li><strong>Net Banking:</strong> 5-7 business days</li>
          <li><strong>COD orders:</strong> Refund to bank account within 7-10 business days</li>
        </ul>

        <h2>Cancellation Policy</h2>
        <p>Orders can be cancelled before shipping. Once shipped, cancellation is not possible — you may return after delivery. To cancel, contact {BUSINESS.email.support} immediately with your order number.</p>

        <h2>Shipping Charges on Returns</h2>
        <p>Return shipping is FREE for defective/wrong products. For change-of-mind returns, a flat ₹99 return shipping fee will be deducted from the refund amount.</p>

        <h2>Contact for Returns</h2>
        <p>Email: {BUSINESS.email.returns}<br/>Phone: {BUSINESS.phone}<br/>Hours: {BUSINESS.hours}</p>
      </div>
    </div>
  )
}
