"use client"

import { useState } from "react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage_footer" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      setSubmitted(true)
      setEmail("")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <p className="mt-6 md:mt-8 text-sm text-[#c4956a] max-w-sm mx-auto">
        You&apos;re in! Check your inbox for your welcome offer.
      </p>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex mt-6 md:mt-8 border border-[#c4956a]/30 overflow-hidden max-w-sm mx-auto">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="flex-1 min-w-0 px-3 md:px-4 py-3 bg-transparent text-sm text-[#f5e6d3] placeholder:text-[#f5e6d3]/30 outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-4 md:px-6 py-3 bg-[#c4956a] text-[#2a1f14] text-[10px] md:text-xs font-bold tracking-wider hover:bg-[#d4a574] transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {submitting ? "..." : "JOIN"}
        </button>
      </form>
      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
    </>
  )
}
