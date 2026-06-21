"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Bell, Gem, MapPin, ClipboardCheck, Wind, Lock, Users, Sparkles } from "lucide-react"

const LAUNCH_DATE = new Date("2025-07-07T09:00:00+05:30")

// Phase dates for adaptive messaging
const PHASE_DATES = {
  earlyAccess: new Date("2025-06-01T00:00:00+05:30"),
  behindCraft: new Date("2025-06-21T00:00:00+05:30"),
  scarcityPush: new Date("2025-07-01T00:00:00+05:30"),
}

function getCurrentPhase(): "earlyAccess" | "behindCraft" | "scarcityPush" {
  const now = new Date()
  if (now >= PHASE_DATES.scarcityPush) return "scarcityPush"
  if (now >= PHASE_DATES.behindCraft) return "behindCraft"
  return "earlyAccess"
}

function getTimeLeft() {
  const now = new Date()
  const diff = LAUNCH_DATE.getTime() - now.getTime()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const PHASE_CONTENT = {
  earlyAccess: {
    badge: "Exclusive First Drop",
    headline: "Something Premium",
    subline: "Is Coming",
    description: "Handcrafted linen shirts born in Jodhpur. Designed for the modern man who values quiet luxury. Our first collection drops exclusively online.",
    cta: "Get Early Access",
  },
  behindCraft: {
    badge: "Behind the Craft",
    headline: "47 Quality Checks.",
    subline: "Zero Compromise.",
    description: "Every VCHUKI shirt is handcrafted in Jodhpur using the finest linen. From fabric selection to final stitch — we obsess over every detail so you don't have to.",
    cta: "Join the Waitlist",
  },
  scarcityPush: {
    badge: "Limited First Batch",
    headline: "Only 10 Designs.",
    subline: "Small Batch. Selling Out.",
    description: "Crafted in small batches in Jodhpur. Once they're gone, they're gone. Our Rajasthan palette — Desert Sand, Royal Indigo, Sage Heritage — won't be restocked immediately.",
    cta: "Secure Your Spot",
  },
}

export function LaunchCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [response, setResponse] = useState<{ message?: string; spotsLeft?: number; position?: number } | null>(null)
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null)
  const [phase] = useState(getCurrentPhase())
  const content = PHASE_CONTENT[phase]

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch current waitlist stats
  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((data) => setSpotsLeft(data.earlyAccessSpotsLeft ?? null))
      .catch(() => {})
  }, [])

  if (!timeLeft) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "website" }),
      })
      const data = await res.json()
      setResponse(data)
      setSubmitted(true)
      if (data.spotsLeft !== undefined) setSpotsLeft(data.spotsLeft)
    } catch {
      setSubmitted(true)
      setResponse({ message: "You're on the list! We'll notify you." })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0a06] text-[#f5e6d3] overflow-hidden relative">
      {/* Background texture */}
      <div className="absolute inset-0 heritage-pattern opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f0a06]/50 to-[#0f0a06]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center py-8 md:py-12">
        <div className="flex items-center gap-3">
          <Image src="/marko.png" alt="VCHUKI" width={40} height={40} className="invert" />
          <div>
            <span className="text-lg font-bold tracking-[0.3em] block leading-none">VCHUKI</span>
            <span className="text-[8px] tracking-[0.15em] text-[#c4956a] block mt-0.5">PREMIUM MENSWEAR</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Phase Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#c4956a]/30 bg-[#c4956a]/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#c4956a] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] font-medium">{content.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1]">
            {content.headline}<br />
            <span className="font-semibold text-[#c4956a]">{content.subline}</span>
          </h1>

          <p className="mt-6 text-sm md:text-base text-[#f5e6d3]/50 max-w-md mx-auto leading-relaxed">
            {content.description}
          </p>

          {/* Scarcity Indicator */}
          {spotsLeft !== null && spotsLeft > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 border border-amber-500/30 bg-amber-500/5"
            >
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] text-amber-300 font-medium">
                {spotsLeft <= 20
                  ? `Only ${spotsLeft} early access spots left!`
                  : `First 100 get 10% off + Free Shipping — ${spotsLeft} spots left`}
              </span>
            </motion.div>
          )}
          {spotsLeft === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 border border-[#c4956a]/30 bg-[#c4956a]/5"
            >
              <Users className="h-3.5 w-3.5 text-[#c4956a]" />
              <span className="text-[11px] text-[#c4956a] font-medium">
                Early access is full! Join the waitlist for launch day notification.
              </span>
            </motion.div>
          )}

          {/* Countdown */}
          <div className="mt-10 flex items-center justify-center gap-4 md:gap-8">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map((unit) => (
              <div key={unit.label} className="text-center">
                <motion.div
                  key={unit.value}
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 md:w-20 md:h-20 border border-[#c4956a]/30 bg-[#c4956a]/5 flex items-center justify-center"
                >
                  <span className="text-2xl md:text-3xl font-light text-[#f5e6d3]">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                </motion.div>
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#f5e6d3]/40 mt-2">{unit.label}</p>
              </div>
            ))}
          </div>

          {/* Launch Date */}
          <p className="mt-8 text-xs text-[#c4956a] uppercase tracking-[0.2em] font-medium">
            Dropping July 7 · 9:00 AM IST
          </p>

          {/* Notify Me Form */}
          <div className="mt-10 max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 border border-[#c4956a]/30 bg-[#c4956a]/5"
                >
                  <p className="text-sm text-[#c4956a] font-medium">{response?.message || "You're on the list! ✓"}</p>
                  {response?.position && (
                    <p className="text-[11px] text-[#f5e6d3]/50 mt-2">Your position: #{response.position}</p>
                  )}
                  <p className="text-[11px] text-[#f5e6d3]/40 mt-1">We&apos;ll notify you before the drop goes live.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex border border-[#c4956a]/30 overflow-hidden"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for early access"
                    required
                    className="flex-1 px-4 py-3.5 bg-transparent text-sm text-[#f5e6d3] placeholder:text-[#f5e6d3]/30 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3.5 bg-[#c4956a] text-[#2a1f14] text-xs font-bold tracking-wider hover:bg-[#d4a574] transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    {content.cta.toUpperCase()}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            {!submitted && (
              <p className="text-[10px] text-[#f5e6d3]/25 mt-3">
                {spotsLeft !== null && spotsLeft > 0
                  ? "First 100 signups get 10% off + free shipping on launch day."
                  : "Get notified the moment we go live. No spam."}
              </p>
            )}
          </div>
        </motion.div>

        {/* Behind the Craft — Phase 2 storytelling */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-16 w-full max-w-3xl mx-auto"
        >
          {phase === "behindCraft" || phase === "scarcityPush" ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: ClipboardCheck, title: "47 Quality Checks", desc: "From fabric inspection to final stitch — every shirt is verified at 47 checkpoints." },
                { icon: MapPin, title: "Born in Jodhpur", desc: "Crafted by artisans carrying generations of Rajasthani textile heritage." },
                { icon: Sparkles, title: "Small Batch Only", desc: "Limited quantities per design. Once sold out, restocking takes 4-6 weeks." },
              ].map((item, i) => (
                <div key={i} className="p-5 border border-[#c4956a]/15 bg-[#c4956a]/3 text-center">
                  <item.icon className="h-5 w-5 text-[#c4956a] mx-auto mb-3" />
                  <h3 className="text-[11px] uppercase tracking-wider font-semibold text-[#f5e6d3]/80 mb-1">{item.title}</h3>
                  <p className="text-[11px] text-[#f5e6d3]/40 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            /* Early Access phase — product teasers */
            <div className="flex items-center justify-center gap-4 md:gap-6">
              {[
                { img: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/beige.png", name: "Desert Sand" },
                { img: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/skyblue.png", name: "Sky Blue" },
                { img: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/fullsleevolivegreenshortshirts.png", name: "Sage Heritage" },
              ].map((item, i) => (
                <div key={i} className="text-center group">
                  <div className="relative w-24 h-32 md:w-32 md:h-44 border border-[#c4956a]/20 bg-[#c4956a]/5 overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                    <Image src={item.img} alt={item.name} fill className="object-contain p-2" sizes="128px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a06]/60 to-transparent" />
                  </div>
                  <p className="text-[9px] uppercase tracking-wider text-[#f5e6d3]/40 mt-2 group-hover:text-[#c4956a] transition-colors">{item.name}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Social proof — waitlist count */}
        {spotsLeft !== null && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-[10px] text-[#f5e6d3]/30 flex items-center gap-2"
          >
            <Users className="h-3 w-3" />
            {100 - (spotsLeft ?? 0)}+ people already on the waitlist
          </motion.p>
        )}
      </main>

      {/* Trust Strip */}
      <footer className="relative z-10 border-t border-[#c4956a]/10 mt-12">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: Gem, label: "Premium Linen Blend" },
            { icon: MapPin, label: "Crafted in Jodhpur" },
            { icon: ClipboardCheck, label: "47 Quality Checks" },
            { icon: Wind, label: "Breathable Comfort" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <item.icon className="h-4 w-4 text-[#c4956a]" />
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#f5e6d3]/60 font-medium">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="text-center pb-6 space-y-1">
          <p className="text-[10px] text-[#f5e6d3]/20">© 2025 Vchuki Fashion Private Limited. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-[#f5e6d3]/30">
            <a href="https://instagram.com/vchuki" target="_blank" rel="noopener noreferrer" className="hover:text-[#c4956a] transition-colors">Instagram</a>
            <a href="https://twitter.com/vchuki" target="_blank" rel="noopener noreferrer" className="hover:text-[#c4956a] transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
