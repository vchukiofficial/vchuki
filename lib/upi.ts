export function isUpiConfigured() {
  return !!process.env.NEXT_PUBLIC_UPI_ID
}

/** Builds a UPI deep link (opens Google Pay/PhonePe/any UPI app with the amount pre-filled). */
export function buildUpiLink({ amount, note }: { amount: number; note: string }): string {
  const pa = process.env.NEXT_PUBLIC_UPI_ID || ""
  const pn = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "VCHUKI"
  const params = new URLSearchParams({
    pa,
    pn,
    am: amount.toFixed(2),
    cu: "INR",
    tn: note,
  })
  return `upi://pay?${params.toString()}`
}
