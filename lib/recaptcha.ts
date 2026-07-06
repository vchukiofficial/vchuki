export function isRecaptchaConfigured() {
  return !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && !!process.env.RECAPTCHA_SECRET_KEY
}

/**
 * Verifies a reCAPTCHA v3 token server-side. Fails open (returns valid: true)
 * when keys aren't configured yet, so checkout isn't blocked before setup.
 */
export async function verifyRecaptcha(token: string | undefined, action: string): Promise<{ valid: boolean; score?: number }> {
  if (!isRecaptchaConfigured()) return { valid: true }
  if (!token) return { valid: false }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY!, response: token }),
    })
    const data = await res.json()
    if (!data.success) return { valid: false }
    if (data.action && data.action !== action) return { valid: false }
    // v3 returns a 0.0 (bot) - 1.0 (human) score
    if (typeof data.score === "number" && data.score < 0.5) return { valid: false, score: data.score }
    return { valid: true, score: data.score }
  } catch {
    // Google's API being down shouldn't block real customers from checking out
    return { valid: true }
  }
}
