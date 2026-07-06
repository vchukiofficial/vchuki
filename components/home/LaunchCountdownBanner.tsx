"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, Mail } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// The Archive Debut — fixed launch moment
const LAUNCH_DATE = new Date("2026-07-07T12:00:00+05:30")

function getTimeLeft() {
  const diff = LAUNCH_DATE.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function LaunchCountdownBanner() {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    setTimeLeft(getTimeLeft())
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Already launched — nothing to show here, homepage products speak for themselves
  if (!timeLeft) return null

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "archive-debut" }),
      })
      const data = await res.json()
      setMessage(data.message || "You'll be notified!")
      setSubmitted(true)
    } catch {
      setMessage("Something went wrong. Try again.")
    }
    setLoading(false)
  }

  const units: { label: string; value: number }[] = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ]

  return (
    <>
      <section className="relative overflow-hidden border-y border-[#c4956a]/20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2a1f14] via-[#1a1209] to-[#2a1f14]" />
        <div className="absolute inset-0 heritage-pattern opacity-20" />
        <div className="container relative z-10 py-8 md:py-14 text-center px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-[#c4956a] font-medium mb-2 md:mb-3">Launching Soon</p>
            <h2 className="text-xl md:text-4xl font-light text-[#f5e6d3] tracking-tight leading-tight">
              The Archive Debut —{" "}
              <span className="font-semibold text-[#c4956a]">Unique Styles</span>
            </h2>
            <p className="text-xs md:text-sm text-[#f5e6d3]/60 mt-2 md:mt-3 max-w-md mx-auto leading-relaxed">
              A new collection unlike anything before it. First 100 customers get 10% off.
            </p>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-2 md:gap-4 mt-6">
              {units.map((u) => (
                <div key={u.label} className="w-14 md:w-20 py-2.5 md:py-4 border border-[#c4956a]/30 bg-[#c4956a]/5">
                  <p className="text-xl md:text-3xl font-light text-[#f5e6d3] tabular-nums">{String(u.value).padStart(2, "0")}</p>
                  <p className="text-[8px] md:text-[9px] uppercase tracking-wider text-[#c4956a] mt-0.5">{u.label}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPopup(true)}
              className="mt-5 md:mt-6 inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-[#c4956a] text-[#2a1f14] text-[10px] md:text-xs font-bold tracking-wider uppercase hover:bg-[#d4a574] transition-colors"
            >
              <Bell className="h-3.5 w-3.5" /> Notify Me
            </button>
          </motion.div>
        </div>
      </section>

      {/* Notify Popup */}
      <AnimatePresence>
        {showPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-background border border-border z-50 p-6 relative"
              >
                <button onClick={() => setShowPopup(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>

                {!submitted ? (
                  <>
                    <div className="text-center mb-5">
                      <div className="w-12 h-12 mx-auto mb-3 bg-[#c4956a]/10 border border-[#c4956a]/20 rounded-full flex items-center justify-center">
                        <Bell className="h-5 w-5 text-[#c4956a]" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground">Get Notified</h3>
                      <p className="text-xs text-muted-foreground mt-1">Enter your email to be the first to know when the Archive Debut goes live.</p>
                    </div>
                    <form onSubmit={handleNotify} className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="your@email.com"
                          className="w-full pl-10 pr-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[#c4956a]/50 text-foreground placeholder:text-muted-foreground/50"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase disabled:opacity-50"
                      >
                        {loading ? "Submitting..." : "Notify Me"}
                      </button>
                    </form>
                    <p className="text-[10px] text-muted-foreground text-center mt-3">No spam. Only launch alerts.</p>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 mx-auto mb-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                      <Check className="h-5 w-5 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">You&apos;re In!</h3>
                    <p className="text-xs text-muted-foreground mt-2">{message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">We&apos;ll email you at <span className="font-medium text-foreground">{email}</span></p>
                    <button onClick={() => setShowPopup(false)} className="mt-4 text-xs text-[#c4956a] font-medium hover:underline">Close</button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
