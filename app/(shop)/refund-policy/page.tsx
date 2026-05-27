import { Metadata } from "next"
import Link from "next/link"
import { BUSINESS } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Return & Exchange Policy — VCHUKI",
  description: "VCHUKI's return and exchange policy. 14-day returns with conditions. Learn about eligibility, refund process, and exchange options.",
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
      <p className="text-sm text-muted-foreground mb-8">Effective from July 2025 · Last updated: July 7, 2025</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:leading-relaxed">

        <h2>Return & Exchange Policy</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>Hassle-free returns within <strong>14 days</strong> of delivery; specific conditions apply based on products and promotions.</li>
          <li>Prepaid orders will be refunded to the original payment method. COD orders can be refunded as store credits or directly to a UPI ID of your choice.</li>
          <li>Issues with defective, incorrect, or damaged products must be reported within <strong>24 hours</strong> of delivery with photographic evidence.</li>
          <li>Items purchased during special sales with free product offers (such as BOGO, combo deals, or promotional bundles) are <strong>ineligible for returns</strong>.</li>
          <li>First-time customers enjoy free returns on their first order — no return fee applies. For all subsequent orders, a reverse shipment fee of <strong>₹25 per item</strong> is charged, up to ₹100 per order.</li>
          <li>To ensure standard hygiene, accessories including belts, caps, and pocket squares <strong>cannot be returned</strong> once delivered.</li>
        </ol>

        <h2>For VCHUKI Premium Members</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>Premium members can return or exchange online orders within <strong>15 days</strong>. Any loyalty points earned on the order will be revoked if items are returned.</li>
          <li>Free gifts received with orders can only be <strong>exchanged, not returned</strong>.</li>
          <li>Items purchased together with a free gift are only eligible for <strong>exchange, not return</strong>, to prevent misuse.</li>
          <li>If you redeem loyalty points within 8 days before they are credited to your account, the associated order is only eligible for exchange, not return.</li>
          <li>First-time customers enjoy free returns on their first order. For subsequent orders, a reverse shipment fee of ₹25 per item applies, up to ₹100 per order.</li>
        </ol>

        <h2>Conditions for Return Eligibility</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Product must be <strong>unused, unwashed, and unaltered</strong></li>
          <li>All original tags and packaging must be intact</li>
          <li>Product must be in the same condition as received</li>
          <li>Return request must be raised within 14 days of delivery</li>
          <li>Products marked &quot;Final Sale&quot; or &quot;Non-Returnable&quot; cannot be returned</li>
        </ul>

        <h2>Items NOT Eligible for Return</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Products that have been worn, washed, ironed, or altered</li>
          <li>Products without original tags and VCHUKI packaging</li>
          <li>Items purchased under BOGO, combo, or promotional offers</li>
          <li>Accessories (belts, caps, pocket squares) — hygiene policy</li>
          <li>Products returned after 14 days of delivery</li>
          <li>Products with customer-caused damage (stains, tears, etc.)</li>
        </ul>

        <h2>Exchange Process</h2>
        <p>We offer exchanges for size or color changes subject to stock availability. To initiate an exchange:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Contact us at {BUSINESS.email.support} with your order number</li>
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
        <p className="text-xs">Note: Refund is processed only after the returned product passes our quality inspection. If the product fails inspection (worn, damaged, tags removed), the return will be rejected and the product shipped back to you.</p>

        <h2>Cancellation Policy</h2>
        <p>Orders can be cancelled within 1 hour of placement. Once the order enters processing or shipping, cancellation is not possible. You may return after delivery as per the return policy above.</p>

        <h2>Contact for Returns</h2>
        <p>Email: {BUSINESS.email.support}<br/>Phone: {BUSINESS.phone}<br/>Hours: {BUSINESS.hours}</p>
        <p className="text-xs">VCHUKI reserves the right to refuse returns that do not meet the above criteria. Repeated misuse of the return policy may result in account restrictions.</p>
      </div>
    </div>
  )
}
