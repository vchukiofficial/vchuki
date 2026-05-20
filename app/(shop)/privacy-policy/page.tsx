import { Metadata } from "next"
import Link from "next/link"
import { BUSINESS } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Privacy Policy — VCHUKI",
  description: "Read VCHUKI's privacy policy. Learn how we collect, use, and protect your personal data. Your privacy is our priority.",
  alternates: { canonical: "https://vchuki.com/privacy-policy" },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-8 md:py-16 max-w-3xl">
      <nav className="text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">Privacy Policy</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: May 20, 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mt-4 [&_p]:leading-relaxed">
        <p>{BUSINESS.legalName} (&quot;VCHUKI&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the website {BUSINESS.domain}. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.</p>

        <h2>1. Information We Collect</h2>
        <h3>Personal Information</h3>
        <p>When you make a purchase or create an account, we collect: full name, email address, phone number, shipping address, billing address, and payment information.</p>
        <h3>Automatically Collected Information</h3>
        <p>We automatically collect: IP address, browser type, device information, pages visited, time spent on pages, referring URLs, and cookies data.</p>
        <h3>Payment Information</h3>
        <p>Payment processing is handled by Razorpay/Stripe. We do NOT store your credit card numbers, CVV, or banking passwords on our servers. All payment data is encrypted and processed by PCI-DSS compliant payment gateways.</p>

        <h2>2. How We Use Your Information</h2>
        <p>We use collected information to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Process and fulfill your orders</li>
          <li>Send order confirmations and shipping updates</li>
          <li>Provide customer support</li>
          <li>Improve our website and services</li>
          <li>Send promotional communications (with your consent)</li>
          <li>Prevent fraud and ensure security</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>3. Cookies</h2>
        <p>We use cookies and similar tracking technologies to enhance your browsing experience. Cookies help us remember your preferences, keep items in your cart, and analyze site traffic. You can disable cookies in your browser settings, but some features may not function properly.</p>

        <h2>4. Data Sharing</h2>
        <p>We do NOT sell your personal data. We share information only with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Payment processors (Razorpay, Stripe) for transaction processing</li>
          <li>Shipping partners (Delhivery, Shiprocket) for order delivery</li>
          <li>Analytics services (Google Analytics) for website improvement</li>
          <li>Law enforcement when required by law</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>We implement industry-standard security measures including SSL/TLS encryption, secure payment gateways, regular security audits, and access controls. However, no method of transmission over the Internet is 100% secure.</p>

        <h2>6. Your Rights</h2>
        <p>You have the right to: access your personal data, correct inaccurate data, request deletion of your data, opt-out of marketing communications, and withdraw consent at any time.</p>

        <h2>7. Data Retention</h2>
        <p>We retain your personal information for as long as your account is active or as needed to provide services. Order data is retained for 7 years for tax and legal compliance.</p>

        <h2>8. Children&apos;s Privacy</h2>
        <p>Our website is not intended for children under 18. We do not knowingly collect personal information from minors.</p>

        <h2>9. Changes to This Policy</h2>
        <p>We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date.</p>

        <h2>10. Contact Us</h2>
        <p>For privacy-related queries, contact us at:</p>
        <p>Email: {BUSINESS.email.support}<br/>Phone: {BUSINESS.phone}<br/>Address: {BUSINESS.fullAddress}</p>
      </div>
    </div>
  )
}
