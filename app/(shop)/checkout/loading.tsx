// Shown instantly while checkout loads, so tapping "Checkout" always gives visible feedback.
export default function CheckoutLoading() {
  return (
    <div className="container py-16 flex flex-col items-center justify-center text-center">
      <div className="h-8 w-8 rounded-full border-2 border-[#c4956a]/30 border-t-[#c4956a] animate-spin" />
      <p className="mt-4 text-xs tracking-wider uppercase text-muted-foreground">Opening secure checkout…</p>
    </div>
  )
}
