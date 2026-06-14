"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

type Step = "email" | "otp" | "reset" | "done"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", ""])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!email) { setError("Enter your email"); return }
    setLoading(true)
    // Simulate OTP send
    setTimeout(() => {
      setStep("otp")
      setLoading(false)
    }, 800)
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 3) {
      document.getElementById(`fp-otp-${index + 1}`)?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`fp-otp-${index - 1}`)?.focus()
    }
  }

  function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const code = otp.join("")
    if (code === "1111") {
      setStep("reset")
    } else {
      setError("Invalid OTP. Use 1111 for verification.")
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }
    if (password !== confirmPassword) { setError("Passwords don't match"); return }
    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        setStep("done")
      } else {
        const data = await res.json()
        setError(data.error || "Failed to reset password")
      }
    } catch {
      setError("Something went wrong")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <Image src="/marko.png" alt="VCHUKI" width={24} height={24} className="dark:invert" />
          <span className="text-base font-semibold tracking-[0.25em] text-foreground">VCHUKI</span>
        </div>

        {step === "email" && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-medium tracking-tight text-foreground">Forgot Password</h1>
              <p className="text-sm text-muted-foreground mt-1">Enter your email to receive a verification code</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {error && <div className="p-3 bg-destructive/5 border border-destructive/20 text-destructive text-xs text-center">{error}</div>}

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors placeholder:text-muted-foreground/50"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-xs text-muted-foreground hover:text-[#c4956a]">← Back to Login</Link>
            </div>

            <div className="mt-6 p-3 border border-[#c4956a]/20 bg-[#c4956a]/5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-1">Demo OTP</p>
              <p className="text-xs text-muted-foreground">OTP: <span className="font-mono font-medium text-foreground">1111</span></p>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-medium tracking-tight text-foreground">Verify OTP</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter the 4-digit code sent to<br />
                <span className="text-foreground font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {error && <div className="p-3 bg-destructive/5 border border-destructive/20 text-destructive text-xs text-center">{error}</div>}

              <div className="flex gap-3 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`fp-otp-${i}`}
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

              <button type="submit" className="w-full py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity">
                Verify OTP
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <button onClick={() => {}} className="text-xs text-muted-foreground hover:text-[#c4956a]">Resend OTP</button>
              <p className="text-[10px] text-muted-foreground">Demo OTP: <span className="font-mono font-medium text-foreground">1111</span></p>
            </div>

            <button onClick={() => { setStep("email"); setError(""); setOtp(["","","",""]); }} className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground">
              ← Back
            </button>
          </>
        )}

        {step === "reset" && (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-medium tracking-tight text-foreground">Reset Password</h1>
              <p className="text-sm text-muted-foreground mt-1">Create a new password for your account</p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              {error && <div className="p-3 bg-destructive/5 border border-destructive/20 text-destructive text-xs text-center">{error}</div>}

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors placeholder:text-muted-foreground/50"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors placeholder:text-muted-foreground/50"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <div className="text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-foreground">Password Reset!</h1>
            <p className="text-sm text-muted-foreground mt-2">Your password has been updated successfully.</p>
            <Link href="/auth/login" className="mt-6 inline-block w-full py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase text-center hover:opacity-90 transition-opacity">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
