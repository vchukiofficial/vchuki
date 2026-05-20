import { Metadata } from "next"
import Link from "next/link"
import { BUSINESS } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Shipping Policy — VCHUKI",
  description: "VCHUKI shipping policy. Free shipping above ₹999. Delivery in 3-7 business days across India. Track your order in real-time.",
  alternates: { canonical: "https://vchuki.com/shipping-policy" },
}

export default function ShippingPolicyPage() {
  return (
    <div className="container py-8 md:py-16 max-w-3xl">
      <nav className="text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">Shipping Policy</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-2">Shipping Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Fast, reliable delivery across India.</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:leading-relaxed">

        <h2>Shipping Charges</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Orders above ₹999:</strong> FREE shipping</li>
          <li><strong>Orders below ₹999:</strong> Flat ₹49 shipping charge</li>
          <li><strong>COD orders:</strong> Additional ₹30 COD handling fee</li>
        </ul>

        <h2>Delivery Timelines</h2>
        <table className="w-full text-sm border">
          <thead><tr className="bg-muted"><th className="p-2 text-left text-foreground">Region</th><th className="p-2 text-left text-foreground">Estimated Delivery</th></tr></thead>
          <tbody>
            <tr className="border-t"><td className="p-2">Metro cities (Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad)</td><td className="p-2">3-5 business days</td></tr>
            <tr className="border-t"><td className="p-2">Tier 2 cities (Pune, Jaipur, Ahmedabad, Lucknow, etc.)</td><td className="p-2">4-6 business days</td></tr>
            <tr className="border-t"><td className="p-2">Rest of India</td><td className="p-2">5-7 business days</td></tr>
            <tr className="border-t"><td className="p-2">Remote/Northeast areas</td><td className="p-2">7-10 business days</td></tr>
          </tbody>
        </table>
        <p className="text-xs">*Business days exclude Sundays and public holidays.</p>

        <h2>Courier Partners</h2>
        <p>We ship through India&apos;s most reliable courier services:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Delhivery</li>
          <li>Blue Dart</li>
          <li>DTDC</li>
          <li>Ecom Express</li>
          <li>India Post (for remote areas)</li>
        </ul>

        <h2>Order Tracking</h2>
        <p>Once your order is shipped, you will receive a tracking link via email and SMS/WhatsApp. You can also track your order from your <Link href="/account/orders" className="text-primary hover:underline">account dashboard</Link>.</p>

        <h2>Shipping Regions</h2>
        <p>We currently ship to all serviceable pin codes across India. International shipping is not available at this time. Enter your pin code at checkout to verify serviceability.</p>

        <h2>Delayed Shipments</h2>
        <p>While we strive to deliver on time, delays may occur due to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Natural disasters or extreme weather</li>
          <li>Courier partner operational issues</li>
          <li>Incorrect or incomplete address</li>
          <li>Recipient unavailable for delivery</li>
          <li>Public holidays or strikes</li>
        </ul>
        <p>If your order is delayed beyond 10 business days, contact us at {BUSINESS.email.support} for assistance.</p>

        <h2>Undelivered Orders</h2>
        <p>If delivery fails after 3 attempts, the order will be returned to our warehouse. We will contact you to rearrange delivery or process a refund.</p>

        <h2>Contact</h2>
        <p>For shipping queries: {BUSINESS.email.support}<br/>Phone: {BUSINESS.phone}<br/>Hours: {BUSINESS.hours}</p>
      </div>
    </div>
  )
}
