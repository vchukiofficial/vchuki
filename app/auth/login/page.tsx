"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

type Step = "credentials" | "otp"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      setStep("otp")
      setLoading(false)
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`)
      next?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`)
      prev?.focus()
    }
  }

  function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join("")
    if (code === "111111") {
      router.push("/")
      router.refresh()
    } else {
      setError("Invalid OTP. Use 111111 for verification.")
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#f5f0eb] dark:bg-[#0a0a0a] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1000&q=85"
            alt="VCHUKI Fashion"
            fill
            className="object-cover opacity-80 dark:opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
        </div>
        <div className="relative z-10 p-12 max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <Image src="/logo-mark.svg" alt="VCHUKI" width={28} height={28} className="invert" />
            <span className="text-white text-lg font-semibold tracking-[0.18em]">VCHUKI</span>
          </div>
          <h2 className="text-white text-3xl font-light leading-snug">
            Premium fashion<br />for the modern man.
          </h2>
          <p className="text-white/60 text-sm mt-4 leading-relaxed">
            Join thousands of men who trust VCHUKI for quality, style, and confidence. Your wardrobe upgrade starts here.
          </p>
          <div className="flex gap-6 mt-8 text-white/50 text-xs">
            <span>500+ Products</span>
            <span>50K+ Customers</span>
            <span>4.8★ Rating</span>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <Image src="/logo-mark.svg" alt="VCHUKI" width={24} height={24} className="dark:invert" />
            <span className="text-base font-semibold tracking-[0.18em]">VCHUKI</span>
          </div>

          {step === "credentials" ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
              </div>

              <form onSubmit={handleCredentials} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/5 border border-destructive/20 text-destructive text-xs text-center">
                    {error}
                  </div>
                )}

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full mt-1.5 px-4 py-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full mt-1.5 px-4 py-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-shadow"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-foreground text-background text-sm font-medium tracking-wide rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Continue"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/register" className="text-foreground font-medium hover:underline">Create one</Link>
                </p>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 pt-6 border-t flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                <span>🔒 SSL Secured</span>
                <span>•</span>
                <span>256-bit Encryption</span>
                <span>•</span>
                <span>PCI Compliant</span>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Verify OTP</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the 6-digit code sent to<br />
                  <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/5 border border-destructive/20 text-destructive text-xs text-center">
                    {error}
                  </div>
                )}

                {/* OTP Input */}
                <div className="flex gap-2 justify-center">
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
                      className="w-11 h-13 md:w-12 md:h-14 text-center text-lg font-semibold rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-foreground text-background text-sm font-medium tracking-wide rounded-md hover:opacity-90 transition-opacity"
                >
                  Verify & Sign In
                </button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Resend OTP
                </button>
                <p className="text-[10px] text-muted-foreground">
                  Demo OTP: <span className="font-mono font-medium text-foreground">111111</span>
                </p>
              </div>

              <button
                onClick={() => { setStep("credentials"); setError(""); setOtp(["","","","","",""]); }}
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
