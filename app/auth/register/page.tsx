"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"

type Step = "form" | "otp"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("form")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState(["", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Send OTP to email first (verify email before creating account)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "register" }),
      })
      const data = await res.json()
      if (!res.ok && data.error) {
        setError(data.error)
        setLoading(false)
        return
      }
      setStep("otp")
    } catch {
      setError("Failed to send verification code")
    }
    setLoading(false)
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 3) {
      document.getElementById(`reg-otp-${index + 1}`)?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`reg-otp-${index - 1}`)?.focus()
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const code = otp.join("")

    // Verify OTP via API
    try {
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code, type: "register" }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok || !verifyData.verified) {
        setError(verifyData.error || "Invalid OTP. Please check your email.")
        setLoading(false)
        return
      }
    } catch {
      setError("Verification failed.")
      setLoading(false)
      return
    }

    // OTP verified — create the account
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Registration failed")
      setLoading(false)
      return
    }

    // Sign the user in immediately so they don't have to log in a second time
    const signInRes = await signIn("credentials", { email, password, redirect: false })
    if (signInRes?.error) {
      router.push("/auth/login")
      return
    }
    router.push("/account")
    router.refresh()
  }

  async function handleResendOtp() {
    setLoading(true)
    setError("")
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "register" }),
      })
    } catch { /* silent */ }
    setLoading(false)
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
          <div className="lg:hidden flex items-center justify-between mb-10">
            <button onClick={() => router.back()} className="h-9 w-9 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="flex items-center gap-2">
              <Image src="/marko.png" alt="VCHUKI" width={36} height={36} className="dark:invert" />
              <div>
                <span className="text-sm font-bold tracking-[0.3em] text-foreground block leading-none">VCHUKI</span>
                <span className="text-[7px] tracking-[0.12em] text-[#c4956a] block mt-0.5">PREMIUM MENSWEAR</span>
              </div>
            </div>
            <div className="w-9" />
          </div>

          {step === "form" ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-medium tracking-tight text-foreground">Create account</h1>
                <p className="text-sm text-muted-foreground mt-1">Join VCHUKI and get 10% off your first order</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/5 border border-destructive/20 text-destructive text-xs text-center">{error}</div>
                )}

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Full Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors placeholder:text-muted-foreground/50"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors placeholder:text-muted-foreground/50"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors placeholder:text-muted-foreground/50 pr-10"
                      placeholder="Min 6 characters"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Sending verification..." : "Continue"}
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
                  <Link href="/auth/login" className="text-[#c4956a] font-medium hover:underline">Sign in</Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-medium tracking-tight text-foreground">Verify Email</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the 4-digit code sent to<br />
                  <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-destructive/5 border border-destructive/20 text-destructive text-xs text-center">{error}</div>
                )}

                <div className="flex gap-3 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`reg-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-14 h-16 text-center text-2xl font-semibold border border-border bg-background text-foreground focus:outline-none focus:border-[#c4956a] transition-colors"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Verify & Create Account"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs text-muted-foreground hover:text-[#c4956a] transition-colors disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>

              <button
                onClick={() => { setStep("form"); setError(""); setOtp(["","","",""]); }}
                className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
