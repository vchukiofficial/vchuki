const BREVO_API_KEY = process.env.BREVO_API_KEY || ""
const SENDER = { name: "VCHUKI", email: process.env.BREVO_SENDER_EMAIL || "support@vchuki.com" }
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "akshayneriya2001@gmail.com"

// ============================================
// CORE SEND FUNCTION
// ============================================

async function brevoSend(to: string, subject: string, htmlContent: string) {
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY not configured")
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "accept": "application/json", "api-key": BREVO_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({
      sender: SENDER,
      to: [{ email: to }],
      subject,
      htmlContent: wrapTemplate(htmlContent),
    }),
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
// PUBLIC EMAIL FUNCTIONS
// ============================================

export async function sendOTPEmail(to: string, otp: string) {
  const tpl = await getTemplate("otp-verification")
  if (tpl) {
    const subject = replaceVars(tpl.subject, { otp })
    const body = replaceVars(tpl.body, { name: to.split("@")[0], otp })
    return brevoSend(to, subject, body)
  }
  // Fallback
  return brevoSend(to, "Your VCHUKI Verification Code", `
    <h2 style="color:#2a1f14;">Verification Code</h2>
    <p style="color:#666;font-size:14px;">Use this code to verify your identity:</p>
    <div style="background:#f5e6d3;padding:20px;text-align:center;margin:20px 0;border-left:4px solid #c4956a;">
      <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2a1f14;">${otp}</span>
    </div>
    <p style="color:#999;font-size:12px;">This code expires in 10 minutes.</p>
  `)
}

export async function sendPasswordResetEmail(to: string, otp: string) {
  const tpl = await getTemplate("password-reset")
  if (tpl) {
    const subject = replaceVars(tpl.subject, { otp })
    const body = replaceVars(tpl.body, { name: to.split("@")[0], otp })
    return brevoSend(to, subject, body)
  }
  return brevoSend(to, "Reset Your VCHUKI Password", `
    <h2 style="color:#2a1f14;">Password Reset</h2>
    <p style="color:#666;font-size:14px;">Use this code to reset your password:</p>
    <div style="background:#f5e6d3;padding:20px;text-align:center;margin:20px 0;border-left:4px solid #c4956a;">
      <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2a1f14;">${otp}</span>
    </div>
    <p style="color:#999;font-size:12px;">If you didn't request this, ignore this email.</p>
  `)
}

export async function sendWelcomeEmail(to: string, name: string) {
  const tpl = await getTemplate("welcome")
  if (tpl) {
    const subject = replaceVars(tpl.subject, { name })
    const body = replaceVars(tpl.body, { name })
    await brevoSend(to, subject, body)
  } else {
    await brevoSend(to, "Welcome to VCHUKI", `
      <h2 style="color:#2a1f14;">Welcome, ${name}!</h2>
      <p style="color:#666;font-size:14px;">Thank you for joining VCHUKI. Explore our premium linen collection.</p>
      <div style="margin:24px 0;"><a href="https://vchuki.com/shirts" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Shop Collection</a></div>
      <p style="color:#999;font-size:12px;">Use code <strong>WELCOME10</strong> for 10% off.</p>
    `)
  }
  // Notify admin
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

  const tpl = await getTemplate("order-confirmation")
  if (tpl) {
    const subject = replaceVars(tpl.subject, { orderId: order.orderId })
    const body = replaceVars(tpl.body, { orderId: order.orderId, itemsTable, discountLine, finalAmount: order.finalAmount.toLocaleString(), paymentMethod: order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay", shippingAddress: addr })
    await brevoSend(to, subject, body)
  } else {
    await brevoSend(to, `Order Confirmed — #${order.orderId}`, `
      <h2 style="color:#2a1f14;">Order Confirmed! 🎉</h2>
      <p style="color:#c4956a;font-size:12px;font-weight:bold;">Order #${order.orderId}</p>
      ${itemsTable}${discountLine}
      <p style="font-size:16px;font-weight:bold;color:#2a1f14;">Total: ₹${order.finalAmount.toLocaleString()}</p>
      <p style="color:#666;font-size:12px;">Payment: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}</p>
      <div style="background:#f9f9f9;padding:12px;margin:16px 0;border-left:3px solid #c4956a;"><p style="font-size:11px;color:#c4956a;margin-bottom:4px;">DELIVERING TO</p><p style="font-size:13px;color:#333;margin:0;">${addr}</p></div>
      <a href="https://vchuki.com/account/orders" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;display:inline-block;">Track Order</a>
    `)
  }
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

  const tpl = await getTemplate("shipping-update")
  if (tpl) {
    const subject = replaceVars(tpl.subject, { orderId: data.orderId })
    const body = replaceVars(tpl.body, { orderId: data.orderId, statusMessage, trackingInfo })
    return brevoSend(to, subject, body)
  }
  return brevoSend(to, `Order Update — #${data.orderId}`, `
    <h2 style="color:#2a1f14;">Shipping Update</h2>
    <p style="color:#c4956a;font-size:12px;font-weight:bold;">Order #${data.orderId}</p>
    <div style="background:#f5e6d3;padding:16px;margin:16px 0;border-left:4px solid #c4956a;"><p style="font-size:14px;color:#2a1f14;margin:0;">${statusMessage}</p></div>
    ${trackingInfo}
    <a href="https://vchuki.com/account/orders" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;display:inline-block;margin-top:12px;">Track Order</a>
  `)
}

// ============================================
// HTML WRAPPER
// ============================================
function wrapTemplate(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">
<tr><td style="background:#2a1f14;padding:24px;text-align:center;">
<span style="color:#f5e6d3;font-size:18px;font-weight:600;letter-spacing:4px;">VCHUKI</span>
<p style="color:#c4956a;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:4px 0 0;">Premium Linen — Crafted in Jodhpur</p>
</td></tr>
<tr><td style="padding:32px 24px;">${content}</td></tr>
<tr><td style="background:#f9f6f3;padding:16px;text-align:center;border-top:1px solid #eee;">
<p style="color:#999;font-size:11px;margin:0;">VCHUKI Fashion Private Limited · Jodhpur, Rajasthan 342001</p>
<p style="color:#c4956a;font-size:10px;margin:8px 0 0;"><a href="https://vchuki.com" style="color:#c4956a;text-decoration:none;">vchuki.com</a> · <a href="mailto:support@vchuki.com" style="color:#c4956a;text-decoration:none;">support@vchuki.com</a></p>
</td></tr>
</table></td></tr></table></body></html>`
}
