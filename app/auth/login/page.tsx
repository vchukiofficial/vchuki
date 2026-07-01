"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"

type Step = "credentials" | "otp"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState(["", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpSending, setOtpSending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      // Send OTP via email
      setOtpSending(true)
      try {
        await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, type: "login" }),
        })
      } catch { /* continue even if email fails */ }
      setOtpSending(false)
      setStep("otp")
      setLoading(false)
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const code = otp.join("")
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code, type: "login" }),
      })
      const data = await res.json()
      if (res.ok && data.verified) {
        // Redirect admin to dashboard, customer to account
        const sessionRes = await fetch("/api/auth/session")
        const sessionData = await sessionRes.json()
        if (sessionData?.user?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/account")
        }
        router.refresh()
      } else {
        setError(data.error || "Invalid OTP. Please try again.")
      }
    } catch {
      setError("Verification failed. Please try again.")
    }
    setLoading(false)
  }

  async function handleResendOtp() {
    setOtpSending(true)
    setError("")
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "login" }),
      })
      setError("")
    } catch { /* silent */ }
    setOtpSending(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#2a1f14] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40"
          >
            <source src="/VCHUKI_–_QUIET_LUXURY_GRWM_REE (2).mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-[#2a1f14]/80 to-[#2a1f14]/40" />
        </div>
        <div className="absolute inset-0 heritage-pattern opacity-20" />
        <div className="relative z-10 p-12 max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <Image src="/marko.png" alt="VCHUKI" width={28} height={28} className="invert" />
            <span className="text-[#f5e6d3] text-lg font-semibold tracking-[0.25em]">VCHUKI</span>
          </div>
          <h2 className="text-[#f5e6d3] text-3xl font-light leading-snug">
            Premium linen<br />for the modern man.
          </h2>
          <p className="text-[#f5e6d3]/50 text-sm mt-4 leading-relaxed">
            Join thousands of men who trust VCHUKI for quality, style, and confidence. Crafted in Jodhpur with heritage craftsmanship.
          </p>
          <div className="flex gap-6 mt-8 text-[#c4956a] text-xs font-medium">
            <span>20+ Products</span>
            <span>Premium Quality</span>
            <span>4.8★ Rating</span>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <Image src="/marko.png" alt="VCHUKI" width={36} height={36} className="dark:invert" />
            <div>
              <span className="text-sm font-bold tracking-[0.3em] text-foreground block leading-none">VCHUKI</span>
              <span className="text-[7px] tracking-[0.12em] text-[#c4956a] block mt-0.5">PREMIUM MENSWEAR</span>
            </div>
          </div>

          {step === "credentials" ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-medium tracking-tight text-foreground">Welcome back</h1>
                <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
              </div>

              <form onSubmit={handleCredentials} className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/5 border border-destructive/20 text-destructive text-xs text-center">
                    {error}
                  </div>
                )}

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
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Password</label>
                    <Link href="/auth/forgot-password" className="text-[10px] text-[#c4956a] hover:underline">Forgot Password?</Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors placeholder:text-muted-foreground/50 pr-10"
                      placeholder="••••••••"
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
                  {loading ? "Verifying..." : "Continue"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register" className="text-[#c4956a] font-medium hover:underline">Create one</Link>
                </p>
                <Link href="/" className="inline-block mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to Home
                </Link>
              </div>

              {/* Trust */}
              <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> SSL Secured</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>256-bit Encryption</span>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-medium tracking-tight text-foreground">Verify OTP</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the 4-digit code sent to<br />
                  <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-destructive/5 border border-destructive/20 text-destructive text-xs text-center">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
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
                  className="w-full py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity"
                >
                  Verify & Sign In
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={otpSending}
                  className="text-xs text-muted-foreground hover:text-[#c4956a] transition-colors disabled:opacity-50"
                >
                  {otpSending ? "Sending..." : "Resend OTP"}
                </button>
              </div>

              <button
                onClick={() => { setStep("credentials"); setError(""); setOtp(["","","",""]); }}
                className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
