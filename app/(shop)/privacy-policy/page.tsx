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
      <p className="text-sm text-muted-foreground mb-8">Last updated: July 7, 2025</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mt-4 [&_p]:leading-relaxed">

        <p>At VCHUKI, we are committed to protecting your privacy and personal information. This Privacy Policy explains how {BUSINESS.legalName} (&quot;VCHUKI&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and safeguards your data when you visit {BUSINESS.domain} or make a purchase.</p>

        <p>It is the policy of VCHUKI to act in accordance with current Indian legislation including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023. We aim to be responsible, relevant, and secure when handling your data.</p>

        <h2>1. Information We Collect</h2>
        <h3>Personal Information (provided by you)</h3>
        <p>When you create an account or make a purchase: full name, email address, phone number, shipping address, billing address.</p>
        <h3>Payment Information</h3>
        <p>Payment processing is handled securely by Razorpay. We do <strong>NOT</strong> store your credit card numbers, CVV, UPI PIN, or banking passwords on our servers. All payment data is encrypted and processed by PCI-DSS Level 1 compliant payment gateways.</p>
        <h3>Automatically Collected Information</h3>
        <p>IP address, browser type, device information, pages visited, time spent on pages, and referring URLs for analytics purposes.</p>

        <h2>2. How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Process and fulfill your orders</li>
          <li>Send order confirmations, shipping updates, and delivery notifications</li>
          <li>Provide customer support</li>
          <li>Improve our website, products, and services</li>
          <li>Send promotional communications (only with your explicit consent)</li>
          <li>Prevent fraud, detect misuse, and ensure platform security</li>
          <li>Comply with legal and regulatory obligations</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>We <strong>never sell, rent, or trade</strong> your personal information to third parties. We share data only with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Payment processors</strong> (Razorpay) — for secure transaction processing</li>
          <li><strong>Shipping partners</strong> (Delhivery, Shiprocket) — for order delivery only</li>
          <li><strong>Analytics services</strong> (Google Analytics) — anonymized data for website improvement</li>
          <li><strong>Law enforcement</strong> — only when required by law or court order</li>
        </ul>
        <p>We do not link your personal data with third-party advertising networks to build customer demographic profiles.</p>

        <h2>4. Cookies</h2>
        <p>We use essential cookies to maintain your shopping cart, remember login sessions, and ensure website functionality. We use analytics cookies (with your consent) to understand how visitors use our site. You can disable non-essential cookies in your browser settings.</p>

        <h2>5. Data Security</h2>
        <p>We implement industry-standard security measures including:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>256-bit SSL/TLS encryption for all data transmission</li>
          <li>PCI-DSS compliant payment processing</li>
          <li>Regular security audits and vulnerability assessments</li>
          <li>Role-based access controls for internal systems</li>
          <li>Encrypted database storage</li>
        </ul>
        <p>While we implement robust security measures, no method of transmission over the Internet is 100% secure. You share information at your own risk.</p>

        <h2>6. Your Rights</h2>
        <p>Under applicable Indian data protection laws, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access your personal data held by us</li>
          <li>Correct inaccurate or incomplete data</li>
          <li>Request deletion of your personal data</li>
          <li>Opt-out of marketing communications at any time</li>
          <li>Withdraw consent for data processing</li>
          <li>Request data portability</li>
        </ul>

        <h2>7. Data Retention</h2>
        <p>We retain personal information for as long as your account is active. Order and transaction data is retained for 8 years for tax, legal, and compliance purposes as required under Indian law. You may request account deletion at any time.</p>

        <h2>8. Children&apos;s Privacy</h2>
        <p>Our website and services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors. If we become aware of such collection, we will delete the data immediately.</p>

        <h2>9. Fraud & Scam Awareness</h2>
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-lg">
          <p className="text-foreground font-medium mb-2">⚠️ Important Notice</p>
          <p>VCHUKI <strong>never</strong> contacts customers to request advance payments, extra charges, or any financial transaction after an order has been placed. We will never ask for your UPI PIN, OTP, CVV, or banking passwords.</p>
          <p className="mt-2">Please exercise caution and do not engage with any fraudulent calls, messages, or phishing attempts claiming to be from VCHUKI.</p>
          <p className="mt-2">If you encounter such activity, immediately:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Report to the National Cyber Crime Helpline: <strong>1930</strong></li>
            <li>File a complaint at: <a href="https://cybercrime.gov.in" className="text-[#c4956a] underline">cybercrime.gov.in</a></li>
            <li>Contact us at {BUSINESS.email.support} with details</li>
          </ul>
        </div>

        <h2>10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. Changes will be posted on this page with an updated revision date. Continued use of our website after changes constitutes acceptance of the updated policy.</p>

        <h2>11. Contact Us</h2>
        <p>For privacy-related queries or to exercise your data rights:</p>
        <p>Email: {BUSINESS.email.support}<br/>Phone: {BUSINESS.phone}<br/>Address: {BUSINESS.fullAddress}</p>

        <p className="text-xs border-t border-border pt-4 mt-8">This Privacy Policy is governed by the laws of India. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of courts in Jodhpur, Rajasthan.</p>
      </div>
    </div>
  )
}
