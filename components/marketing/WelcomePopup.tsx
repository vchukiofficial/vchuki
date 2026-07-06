"use client"

import { useEffect, useState } from "react"
import { X, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const SEEN_KEY = "vchuki-welcome-popup-seen-at"
const SUBSCRIBED_KEY = "vchuki-welcome-popup-subscribed"
const SHOW_AFTER_MS = 3500
const RESHOW_AFTER_DAYS = 7

export function WelcomePopup() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (localStorage.getItem(SUBSCRIBED_KEY)) return
    const lastSeen = Number(localStorage.getItem(SEEN_KEY) || 0)
    const daysSinceSeen = (Date.now() - lastSeen) / (1000 * 60 * 60 * 24)
    if (lastSeen && daysSinceSeen < RESHOW_AFTER_DAYS) return

    const timer = setTimeout(() => setOpen(true), SHOW_AFTER_MS)
    return () => clearTimeout(timer)
  }, [])

  function close() {
    setOpen(false)
    localStorage.setItem(SEEN_KEY, String(Date.now()))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "welcome_popup" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      setSubmitted(true)
      localStorage.setItem(SUBSCRIBED_KEY, "true")
      setTimeout(close, 4000)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[420px] bg-background border border-border z-[70]"
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 h-8 w-8 border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-8 text-center">
              <p className="text-[10px] uppercase tracking-[3px] text-[#c4956a] font-medium mb-2">Premium Linen Blend · Jodhpur</p>

              {!submitted ? (
                <>
                  <h2 className="font-display text-2xl md:text-3xl font-light text-foreground mb-2">Welcome to VCHUKI</h2>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Subscribe for early access to new drops and take <strong className="text-foreground">10% off</strong> your first order.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border border-border bg-background text-sm text-foreground text-center focus:outline-none focus:border-[#c4956a]/50"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[11px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
                    >
                      {submitting ? "Subscribing..." : "Subscribe & Save 10%"}
                    </button>
                  </form>
                  {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
                  <button onClick={close} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground mt-4">
                    No thanks, I'll pay full price
                  </button>
                </>
              ) : (
                <div className="py-4">
                  <div className="h-12 w-12 rounded-full bg-[#c4956a]/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-5 w-5 text-[#c4956a]" />
                  </div>
                  <h2 className="font-display text-xl font-light text-foreground mb-2">You're in!</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Check your inbox and use code <strong className="text-foreground">WELCOME10</strong> for 10% off your first order.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
