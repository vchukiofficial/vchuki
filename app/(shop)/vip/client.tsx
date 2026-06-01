"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Bell, Lock, Check, Gem, MapPin, ClipboardCheck } from "lucide-react"

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
    <div className="min-h-screen flex flex-col bg-[#0f0a06] text-[#f5e6d3]">
      <div className="absolute inset-0 heritage-pattern opacity-10" />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto w-full"
        >
          {/* Logo */}
          <Image src="/marko.png" alt="VCHUKI" width={48} height={48} className="invert mx-auto mb-6" />

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-light tracking-tight">
            Get <span className="font-semibold text-[#c4956a]">Early Access</span>
          </h1>

          <p className="mt-4 text-sm text-[#f5e6d3]/50 leading-relaxed">
            Premium linen shirts handcrafted in Jodhpur. Our debut collection drops July 7.
          </p>

          {/* Scarcity */}
          {spotsLeft !== null && spotsLeft > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 border border-amber-500/30 bg-amber-500/5">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] text-amber-300 font-medium">
                First 100 get 10% off + Free Shipping — {spotsLeft} spots left
              </span>
            </div>
          )}

          {/* Form */}
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
                  <p className="text-[11px] text-[#f5e6d3]/50 mt-2">Your position: #{response.position}</p>
                )}
                <p className="text-[11px] text-[#f5e6d3]/30 mt-3">Share with friends to move up the list.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full px-4 py-3.5 bg-transparent border border-[#c4956a]/30 text-sm text-[#f5e6d3] placeholder:text-[#f5e6d3]/30 outline-none focus:border-[#c4956a]/60 transition-colors"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="WhatsApp number (optional)"
                  className="w-full px-4 py-3.5 bg-transparent border border-[#c4956a]/30 text-sm text-[#f5e6d3] placeholder:text-[#f5e6d3]/30 outline-none focus:border-[#c4956a]/60 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-[#c4956a] text-[#2a1f14] text-sm font-bold tracking-wider hover:bg-[#d4a574] transition-colors flex items-center justify-center gap-2"
                >
                  <Bell className="h-4 w-4" />
                  GET EARLY ACCESS
                </button>
              </form>
            )}
          </div>

          {/* What you get */}
          {!submitted && (
            <div className="mt-8 space-y-3 text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#c4956a] font-medium text-center">What you get</p>
              {[
                "10% off on launch day (first 100 only)",
                "2-hour early access before public launch",
                "Free shipping on your first order",
              ].map((perk, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 border border-[#c4956a]/10 bg-[#c4956a]/3">
                  <Check className="h-3.5 w-3.5 text-[#c4956a] flex-shrink-0" />
                  <span className="text-[11px] text-[#f5e6d3]/70">{perk}</span>
                </div>
              ))}
            </div>
          )}

          {/* Trust */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Gem, label: "Premium Linen" },
              { icon: MapPin, label: "Made in Jodhpur" },
              { icon: ClipboardCheck, label: "47 QC Checks" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <item.icon className="h-4 w-4 text-[#c4956a]/60" />
                <p className="text-[9px] uppercase tracking-wider text-[#f5e6d3]/40">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[10px] text-[#f5e6d3]/20">No spam. Unsubscribe anytime.</p>
        </motion.div>
      </main>
    </div>
  )
}
