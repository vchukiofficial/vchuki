"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const fd = new FormData(e.currentTarget)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), password: fd.get("password") }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Registration failed")
      setLoading(false)
    } else {
      router.push("/auth/login")
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#f5f0eb] dark:bg-[#0a0a0a] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=1000&q=85"
            alt="VCHUKI Fashion"
            fill
            className="object-cover opacity-80 dark:opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
        </div>
        <div className="relative z-10 p-12 max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <Image src="/marko.png" alt="VCHUKI" width={28} height={28} className="invert" />
            <span className="text-white text-lg font-semibold tracking-[0.18em]">VCHUKI</span>
          </div>
          <h2 className="text-white text-3xl font-light leading-snug">
            Join the club.<br />Elevate your style.
          </h2>
          <p className="text-white/60 text-sm mt-4 leading-relaxed">
            Create your account and get 10% off your first order. Access exclusive drops, early sales, and personalized recommendations.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Image src="/marko.png" alt="VCHUKI" width={24} height={24} className="dark:invert" />
            <span className="text-base font-semibold tracking-[0.18em]">VCHUKI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground mt-1">Join VCHUKI and get 10% off your first order</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/5 border border-destructive/20 text-destructive text-xs text-center">
                {error}
              </div>
            )}

            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Full Name</label>
              <input
                name="name"
                required
                className="w-full mt-1.5 px-4 py-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-shadow"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full mt-1.5 px-4 py-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-shadow"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full mt-1.5 px-4 py-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-shadow"
                placeholder="Min 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-foreground text-background text-sm font-medium tracking-wide rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-[10px] text-muted-foreground text-center leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="/terms-and-conditions" className="underline">Terms</Link> and{" "}
            <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
          </p>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-foreground font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
