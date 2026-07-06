"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Lock, Check, Gem, MapPin, ClipboardCheck } from "lucide-react"

export function EarlyAccessClient() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [response, setResponse] = useState<{ message?: string; position?: number; spotsLeft?: number } | null>(null)
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((data) => setSpotsLeft(data.earlyAccessSpotsLeft ?? null))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, source: "instagram" }),
      })
      const data = await res.json()
      setResponse(data)
      setSubmitted(true)
    } catch {
      setSubmitted(true)
      setResponse({ message: "You're on the list!" })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <div className="absolute inset-0 heritage-pattern opacity-10 dark:opacity-10" />

      {/* Minimal header */}
      <header className="relative z-10 flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <Image src="/marko.png" alt="VCHUKI" width={36} height={36} className="dark:invert" />
          <div>
            <span className="text-sm font-bold tracking-[0.3em] block leading-none text-foreground">VCHUKI</span>
            <span className="text-[7px] tracking-[0.15em] text-[#c4956a] block mt-0.5">PREMIUM MENSWEAR</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-12 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto w-full"
        >
          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
            The Archive Debut — <span className="font-semibold text-[#c4956a]">Unique Styles</span>
          </h1>

          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Premium linen blend shirts handcrafted in Jodhpur. Our new collection launches tomorrow at 12 PM — join the VIP list for early access and exclusive perks.
          </p>

          {/* Scarcity — always visible */}
          {spotsLeft !== null && spotsLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10"
            >
              <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                First 100 get 10% off + Free Shipping — {spotsLeft} spots left
              </span>
            </motion.div>
          )}

          {/* FORM — Primary focus for cold visitors */}
          <div className="mt-8 w-full">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 border border-[#c4956a]/30 bg-[#c4956a]/5 text-center"
              >
                <Check className="h-8 w-8 text-[#c4956a] mx-auto mb-3" />
                <p className="text-sm text-[#c4956a] font-medium">{response?.message}</p>
                {response?.position && (
                  <p className="text-[11px] text-muted-foreground mt-2">Your position: #{response.position}</p>
                )}
                <p className="text-[11px] text-muted-foreground/60 mt-3">Check your inbox for your VIP discount code.</p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  autoFocus
                  className="w-full px-4 py-4 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[#c4956a] transition-colors"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="WhatsApp number (optional, for order updates)"
                  className="w-full px-4 py-4 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-[#c4956a] transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-sm font-bold tracking-wider hover:opacity-90 transition-opacity"
                >
                  JOIN THE VIP CLUB
                </button>
              </motion.form>
            )}
          </div>

          {/* Perks — below form */}
          {!submitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 space-y-2.5 text-left"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#c4956a] font-medium text-center mb-3">What VIP members get</p>
              {[
                "10% off your first order (first 100 only)",
                "Early access to new drops and restocks",
                "Free shipping on your first order",
              ].map((perk, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 border border-[#c4956a]/10 bg-[#c4956a]/5">
                  <Check className="h-3.5 w-3.5 text-[#c4956a] flex-shrink-0" />
                  <span className="text-[11px] text-muted-foreground">{perk}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Trust badges */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Gem, label: "Premium Linen Blend" },
              { icon: MapPin, label: "Made in Jodhpur" },
              { icon: ClipboardCheck, label: "47 QC Checks" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <item.icon className="h-4 w-4 text-[#c4956a]/60" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[10px] text-muted-foreground/50">No spam. Unsubscribe anytime.</p>
        </motion.div>
      </main>

      {/* Minimal footer — no nav links */}
      <footer className="relative z-10 text-center py-4 text-[10px] text-muted-foreground/50">
        © 2026 Vchuki Fashion Private Limited
      </footer>
    </div>
  )
}
