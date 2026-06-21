const BREVO_API_KEY = process.env.BREVO_API_KEY || ""
const SENDER = { name: "VCHUKI - Premium Linen Blend, Crafted in Jodhpur", email: process.env.BREVO_SENDER_EMAIL || "hello@vchuki.com" }
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "akshayneriya2001@gmail.com"
const BCC_ORDER_EMAIL = "akshayneriya2001@gmail.com"

// ============================================
// CORE SEND FUNCTION
// ============================================

async function brevoSend(to: string, subject: string, htmlContent: string, bcc?: string) {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY not configured")
  const payload: any = {
    sender: SENDER,
    to: [{ email: to }],
    subject,
    htmlContent: wrapTemplate(htmlContent),
  }
  if (bcc) payload.bcc = [{ email: bcc }]
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "accept": "application/json", "api-key": BREVO_API_KEY, "content-type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Email send failed")
  return data
}

// ============================================
// TEMPLATE LOADER — DB first, fallback to defaults
// ============================================

async function getTemplate(slug: string): Promise<{ subject: string; body: string } | null> {
  try {
    const { default: connectDB } = await import("@/lib/mongodb")
    await connectDB()
    const { default: EmailTemplate } = await import("@/models/EmailTemplate")
    const tpl = await EmailTemplate.findOne({ slug, isActive: true }).lean() as any
    if (tpl) return { subject: tpl.subject, body: tpl.body }
  } catch { /* fallback to default */ }
  return null
}

function replaceVars(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value)
  }
  return result
}

// ============================================
// UNIVERSAL TEMPLATE SEND — all emails route through here
// ============================================

async function sendViaTemplate(slug: string, to: string, vars: Record<string, string>, fallbackSubject: string, fallbackBody: string, bcc?: string) {
  const tpl = await getTemplate(slug)
  if (tpl) {
    const subject = replaceVars(tpl.subject, vars)
    const body = replaceVars(tpl.body, vars)
    return brevoSend(to, subject, body, bcc)
  }
  const subject = replaceVars(fallbackSubject, vars)
  const body = replaceVars(fallbackBody, vars)
  return brevoSend(to, subject, body, bcc)
}

// ============================================
// PUBLIC EMAIL FUNCTIONS
// ============================================

export async function sendOTPEmail(to: string, otp: string) {
  return sendViaTemplate("otp-verification", to, { name: to.split("@")[0], otp },
    "Your VCHUKI Verification Code — {{otp}}",
    `<h2 style="color:#2a1f14;">Verification Code</h2>
    <p style="color:#666;font-size:14px;">Hi {{name}}, use this code to verify your identity:</p>
    <div style="background:#f5e6d3;padding:20px;text-align:center;margin:20px 0;border-left:4px solid #c4956a;">
      <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2a1f14;">{{otp}}</span>
    </div>
    <p style="color:#999;font-size:12px;">This code expires in 10 minutes.</p>`
  )
}

export async function sendPasswordResetEmail(to: string, otp: string) {
  return sendViaTemplate("password-reset", to, { name: to.split("@")[0], otp },
    "Reset Your VCHUKI Password",
    `<h2 style="color:#2a1f14;">Password Reset</h2>
    <p style="color:#666;font-size:14px;">Hi {{name}}, use this code to reset your password:</p>
    <div style="background:#f5e6d3;padding:20px;text-align:center;margin:20px 0;border-left:4px solid #c4956a;">
      <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2a1f14;">{{otp}}</span>
    </div>
    <p style="color:#999;font-size:12px;">If you didn't request this, ignore this email.</p>`
  )
}

export async function sendWelcomeEmail(to: string, name: string) {
  await sendViaTemplate("welcome", to, { name },
    "Welcome to VCHUKI, {{name}}!",
    `<h2 style="color:#2a1f14;">Welcome, {{name}}!</h2>
    <p style="color:#666;font-size:14px;">Thank you for joining VCHUKI. Explore our premium linen collection.</p>
    <div style="margin:24px 0;"><a href="https://vchuki.com/shirts" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Shop Collection</a></div>
    <p style="color:#999;font-size:12px;">Use code <strong>WELCOME10</strong> for 10% off.</p>`
  )
  await brevoSend(ADMIN_EMAIL, `New User: ${name}`, `<p><strong>${name}</strong> (${to}) registered.</p>`).catch(() => {})
}

export async function sendOrderConfirmationEmail(to: string, order: {
  orderId: string
  items: { name: string; size: string; color: string; quantity: number; price: number }[]
  finalAmount: number
  discountAmount: number
  paymentMethod: string
  shippingAddress: { name: string; street: string; city: string; state: string; zip: string; phone: string }
}) {
  const itemsHtml = order.items.map(i => `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;">${i.name} (${i.size}/${i.color})</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">×${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${i.price.toLocaleString()}</td></tr>`).join("")
  const itemsTable = `<table style="width:100%;border-collapse:collapse;margin:16px 0;"><thead><tr style="background:#f5e6d3;"><th style="padding:8px;text-align:left;font-size:11px;">Item</th><th style="padding:8px;font-size:11px;">Qty</th><th style="padding:8px;text-align:right;font-size:11px;">Price</th></tr></thead><tbody>${itemsHtml}</tbody></table>`
  const discountLine = order.discountAmount > 0 ? `<p style="color:#059669;font-size:13px;">Discount: -₹${order.discountAmount}</p>` : ""
  const addr = `${order.shippingAddress.name}<br>${order.shippingAddress.street}<br>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}<br>📞 ${order.shippingAddress.phone}`

  await sendViaTemplate("order-confirmation", to, {
    orderId: order.orderId, itemsTable, discountLine,
    finalAmount: order.finalAmount.toLocaleString(),
    paymentMethod: order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay",
    shippingAddress: addr
  },
    "Order Confirmed — #{{orderId}}",
    `<h2 style="color:#2a1f14;">Order Confirmed! 🎉</h2>
    <p style="color:#c4956a;font-size:12px;font-weight:bold;">Order #{{orderId}}</p>
    {{itemsTable}}{{discountLine}}
    <p style="font-size:16px;font-weight:bold;color:#2a1f14;">Total: ₹{{finalAmount}}</p>
    <p style="color:#666;font-size:12px;">Payment: {{paymentMethod}}</p>
    <div style="background:#f9f9f9;padding:12px;margin:16px 0;border-left:3px solid #c4956a;"><p style="font-size:11px;color:#c4956a;margin-bottom:4px;">DELIVERING TO</p><p style="font-size:13px;color:#333;margin:0;">{{shippingAddress}}</p></div>
    <a href="https://vchuki.com/account/orders" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;display:inline-block;">Track Order</a>`,
    BCC_ORDER_EMAIL
  )
  await brevoSend(ADMIN_EMAIL, `New Order #${order.orderId} — ₹${order.finalAmount}`, `<p>Order: #${order.orderId}<br>Amount: ₹${order.finalAmount}<br>Customer: ${order.shippingAddress.name} (${to})</p>`).catch(() => {})
}

export async function sendShippingUpdateEmail(to: string, data: { orderId: string; status: string; courier?: string; awb?: string }) {
  const msgs: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being prepared.",
    packaging: "Your order is being carefully packed.",
    dispatched: `Dispatched${data.courier ? ` via ${data.courier}` : ""}.${data.awb ? ` AWB: ${data.awb}` : ""}`,
    shipped: "Your order is in transit.",
    out_for_delivery: "Out for delivery — arriving today!",
    delivered: "Delivered! We hope you love it.",
  }
  const statusMessage = msgs[data.status] || data.status
  const trackingInfo = data.awb ? `<p style="color:#666;font-size:12px;">Tracking: ${data.courier} — ${data.awb}</p>` : ""

  return sendViaTemplate("shipping-update", to, { orderId: data.orderId, statusMessage, trackingInfo },
    "Order Update — #{{orderId}}",
    `<h2 style="color:#2a1f14;">Shipping Update</h2>
    <p style="color:#c4956a;font-size:12px;font-weight:bold;">Order #{{orderId}}</p>
    <div style="background:#f5e6d3;padding:16px;margin:16px 0;border-left:4px solid #c4956a;"><p style="font-size:14px;color:#2a1f14;margin:0;">{{statusMessage}}</p></div>
    {{trackingInfo}}
    <a href="https://vchuki.com/account/orders" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;display:inline-block;margin-top:12px;">Track Order</a>`
  )
}

export async function sendWaitlistConfirmation(to: string, position: number, earlyAccess: boolean) {
  const perks = earlyAccess
    ? `<div style="background:#f5e6d3;padding:16px;margin:16px 0;border-left:4px solid #c4956a;"><p style="font-size:14px;color:#2a1f14;margin:0;font-weight:bold;">🎉 You've unlocked early access!</p><p style="font-size:12px;color:#666;margin:8px 0 0;">10% off + free shipping on launch day.</p></div>`
    : ""
  return sendViaTemplate("waitlist-confirmation", to, { position: String(position), perks },
    "You're on the VCHUKI Waitlist! 🎉",
    `<h2 style="color:#2a1f14;">You're In!</h2>
    <p style="color:#666;font-size:14px;">You're <strong>#{{position}}</strong> on our waitlist for the July collection drop.</p>
    {{perks}}
    <p style="color:#666;font-size:13px;">We'll notify you the moment new styles go live. Stay tuned for fresh colors, premium linen, and modern designs.</p>
    <div style="margin:24px 0;"><a href="https://vchuki.com/shirts" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Shop Current Collection</a></div>
    <p style="color:#999;font-size:11px;">Thank you for your interest in VCHUKI.</p>`
  )
}

export async function sendAccountCreatedEmail(to: string, name: string, phone: string) {
  return sendViaTemplate("account-created", to, { name, phone, email: to },
    "Your VCHUKI Account is Ready!",
    `<h2 style="color:#2a1f14;">Account Created, {{name}}!</h2>
    <p style="color:#666;font-size:14px;">Your VCHUKI account has been created automatically when you placed your order.</p>
    <div style="background:#f5e6d3;padding:16px;margin:16px 0;border-left:4px solid #c4956a;">
      <p style="font-size:12px;color:#2a1f14;margin:0;"><strong>Login Details:</strong></p>
      <p style="font-size:13px;color:#333;margin:4px 0 0;">Email: {{email}}<br>Password: Your phone number ({{phone}})</p>
    </div>
    <p style="color:#666;font-size:13px;">You can now track orders, manage your profile, and get exclusive offers.</p>
    <div style="margin:24px 0;"><a href="https://vchuki.com/auth/login" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Login Now</a></div>
    <p style="color:#999;font-size:11px;">We recommend changing your password after first login.</p>`
  )
}

export async function sendAbandonedCartEmail(to: string, name: string, itemsList: string) {
  return sendViaTemplate("abandoned-cart", to, { name, itemsList, cartLink: "https://vchuki.com/cart" },
    "You left something behind, {{name}}!",
    `<h2 style="color:#2a1f14;">Still thinking it over?</h2>
    <p style="color:#666;font-size:14px;">Hi {{name}}, you left some premium items in your bag:</p>
    {{itemsList}}
    <p style="color:#666;font-size:13px;">Complete your order before they sell out.</p>
    <div style="margin:24px 0;"><a href="{{cartLink}}" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Complete Purchase</a></div>
    <p style="color:#999;font-size:11px;">Free shipping on orders above ₹1,599</p>`
  )
}

export async function sendOrderCancelledEmail(to: string, data: { name: string; orderId: string; reason: string; refundInfo?: string }) {
  return sendViaTemplate("order-cancelled", to, {
    name: data.name, orderId: data.orderId, reason: data.reason,
    refundInfo: data.refundInfo || "<p style=\"color:#666;font-size:12px;\">If you paid online, your refund will be processed within 5-7 business days.</p>"
  },
    "Order #{{orderId}} Cancelled",
    `<h2 style="color:#2a1f14;">Order Cancelled</h2>
    <p style="color:#666;font-size:14px;">Hi {{name}}, your order <strong>#{{orderId}}</strong> has been cancelled.</p>
    <div style="background:#fef2f2;padding:16px;margin:16px 0;border-left:4px solid #ef4444;"><p style="font-size:13px;color:#333;margin:0;">Reason: {{reason}}</p></div>
    {{refundInfo}}
    <div style="margin:24px 0;"><a href="https://vchuki.com/shirts" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Shop Again</a></div>`
  )
}

export async function sendRefundProcessedEmail(to: string, data: { name: string; orderId: string; refundAmount: string; refundMethod: string }) {
  return sendViaTemplate("refund-processed", to, data,
    "Refund Processed — #{{orderId}}",
    `<h2 style="color:#2a1f14;">Refund Processed</h2>
    <p style="color:#666;font-size:14px;">Hi {{name}}, your refund for order <strong>#{{orderId}}</strong> has been processed.</p>
    <div style="background:#f0fdf4;padding:16px;margin:16px 0;border-left:4px solid #22c55e;"><p style="font-size:14px;color:#166534;margin:0;font-weight:bold;">₹{{refundAmount}} refunded</p><p style="font-size:12px;color:#666;margin:6px 0 0;">Via: {{refundMethod}}</p></div>
    <p style="color:#999;font-size:12px;">Please allow 5-7 business days for the amount to reflect.</p>`
  )
}

export async function sendPaymentFailedEmail(to: string, data: { name: string; orderId: string; amount: string }) {
  return sendViaTemplate("payment-failed", to, data,
    "Payment Failed — Action Required",
    `<h2 style="color:#2a1f14;">Payment Failed</h2>
    <p style="color:#666;font-size:14px;">Hi {{name}}, your payment of <strong>₹{{amount}}</strong> for order #{{orderId}} could not be processed.</p>
    <div style="background:#fef2f2;padding:16px;margin:16px 0;border-left:4px solid #ef4444;"><p style="font-size:13px;color:#333;margin:0;">Please try again with a different payment method.</p></div>
    <div style="margin:24px 0;"><a href="https://vchuki.com/cart" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Retry Payment</a></div>`
  )
}

export async function sendReviewRequestEmail(to: string, data: { name: string; orderId: string; productName: string; productSlug: string }) {
  return sendViaTemplate("review-request", to, {
    ...data, reviewLink: `https://vchuki.com/product/${data.productSlug}#reviews`
  },
    "How was your VCHUKI order, {{name}}?",
    `<h2 style="color:#2a1f14;">How was your order?</h2>
    <p style="color:#666;font-size:14px;">Hi {{name}}, we hope you're loving your <strong>{{productName}}</strong>!</p>
    <p style="color:#666;font-size:13px;">Your feedback helps other customers. It only takes a minute.</p>
    <div style="margin:24px 0;"><a href="{{reviewLink}}" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Write a Review</a></div>
    <p style="color:#c4956a;font-size:12px;">⭐ Reviewers get 5% off their next order!</p>`
  )
}

export async function sendBackInStockEmail(to: string, data: { name: string; productName: string; productSlug: string }) {
  return sendViaTemplate("back-in-stock", to, {
    ...data, productLink: `https://vchuki.com/product/${data.productSlug}`
  },
    "Good News! {{productName}} is Back in Stock",
    `<h2 style="color:#2a1f14;">It's Back! 🎉</h2>
    <p style="color:#666;font-size:14px;">Hi {{name}}, great news! <strong>{{productName}}</strong> is back in stock.</p>
    <p style="color:#666;font-size:13px;">Don't miss it this time — our popular items sell out fast.</p>
    <div style="margin:24px 0;"><a href="{{productLink}}" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Shop Now</a></div>`
  )
}

export async function sendPromoEmail(to: string, data: { subject: string; heading: string; content: string; ctaText: string; ctaLink: string }) {
  return sendViaTemplate("promo-blast", to, data,
    "{{subject}}",
    `<h2 style="color:#2a1f14;">{{heading}}</h2>
    {{content}}
    <div style="margin:24px 0;"><a href="{{ctaLink}}" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">{{ctaText}}</a></div>`
  )
}

export async function sendVIPLaunchAlert(to: string, data: { name: string; discountCode: string }) {
  return sendViaTemplate("vip-launch-alert", to, { ...data, shopLink: "https://vchuki.com/shirts" },
    "🚨 VIP Early Access is LIVE — 2 Hours Before Everyone!",
    `<h2 style="color:#2a1f14;">It's GO Time! 🚀</h2>
    <p style="color:#666;font-size:14px;">Hi {{name}}, your VIP early access is now <strong>LIVE</strong>.</p>
    <div style="background:#f5e6d3;padding:20px;margin:20px 0;border-left:4px solid #c4956a;text-align:center;"><p style="font-size:11px;color:#c4956a;margin:0;text-transform:uppercase;letter-spacing:2px;">Your VIP Code</p><p style="font-size:28px;font-weight:bold;color:#2a1f14;margin:8px 0;letter-spacing:4px;">{{discountCode}}</p><p style="font-size:12px;color:#666;margin:0;">10% off + Free Shipping</p></div>
    <div style="margin:24px 0;text-align:center;"><a href="{{shopLink}}" style="background:#2a1f14;color:#f5e6d3;padding:14px 32px;text-decoration:none;font-size:13px;text-transform:uppercase;font-weight:bold;">Shop Now →</a></div>`
  )
}

// ============================================
// HTML WRAPPER — all emails get this chrome
// ============================================
function wrapTemplate(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">
<tr><td style="background:#2a1f14;padding:28px 24px;text-align:center;">
<img src="https://vchuki.com/marko.png" alt="V" width="36" height="36" style="display:block;margin:0 auto 10px;filter:invert(1);" />
<span style="color:#f5e6d3;font-size:20px;font-weight:600;letter-spacing:5px;display:block;">VCHUKI</span>
<p style="color:#c4956a;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:6px 0 0;">Premium Linen Blend — Crafted in Jodhpur</p>
</td></tr>
<tr><td style="padding:32px 24px;">${content}</td></tr>
<tr><td style="background:#f9f6f3;padding:16px;text-align:center;border-top:1px solid #eee;">
<p style="color:#999;font-size:11px;margin:0;">VCHUKI Fashion Private Limited · Jodhpur, Rajasthan 342001</p>
<p style="color:#c4956a;font-size:10px;margin:8px 0 0;"><a href="https://vchuki.com" style="color:#c4956a;text-decoration:none;">vchuki.com</a> · <a href="mailto:support@vchuki.com" style="color:#c4956a;text-decoration:none;">support@vchuki.com</a></p>
</td></tr>
</table></td></tr></table></body></html>`
}
