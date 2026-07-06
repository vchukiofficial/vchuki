declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
    }
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

export function isRecaptchaEnabled() {
  return !!SITE_KEY
}

let scriptLoadPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (!SITE_KEY) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise
  scriptLoadPromise = new Promise((resolve) => {
    if (document.querySelector('script[data-recaptcha]')) return resolve()
    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.dataset.recaptcha = "true"
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

/** Returns a fresh reCAPTCHA v3 token, or undefined if reCAPTCHA isn't configured. */
export async function getRecaptchaToken(action: string): Promise<string | undefined> {
  if (!SITE_KEY) return undefined
  await loadScript()
  return new Promise((resolve) => {
    window.grecaptcha!.ready(async () => {
      try {
        const token = await window.grecaptcha!.execute(SITE_KEY, { action })
        resolve(token)
      } catch {
        resolve(undefined)
      }
    })
  })
}
