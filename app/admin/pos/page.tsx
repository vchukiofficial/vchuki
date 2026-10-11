"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ScanBarcode, Minus, Plus, Trash2, Printer, Check, Package } from "lucide-react"
import type { StockItem } from "@/lib/inventory"

interface Line { item: StockItem; quantity: number }

interface Receipt {
  billNo: string
  date: string
  items: { name: string; size: string; color: string; quantity: number; price: number }[]
  totalAmount: number
  discountAmount: number
  finalAmount: number
  paymentMethod: string
  customerName: string
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`

export default function ShopBillingPage() {
  const [lines, setLines] = useState<Line[]>([])
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [discount, setDiscount] = useState("")
  const [payment, setPayment] = useState<"cash" | "upi" | "card">("cash")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const scanRef = useRef<HTMLInputElement>(null)

  useEffect(() => { scanRef.current?.focus() }, [receipt])

  const subtotal = lines.reduce((s, l) => s + l.item.price * l.quantity, 0)
  const discountValue = Math.min(subtotal, Math.max(0, Number(discount) || 0))
  const total = subtotal - discountValue
  const units = lines.reduce((s, l) => s + l.quantity, 0)

  // A USB/Bluetooth scanner types the barcode and presses Enter — so this is a plain form
  async function onScan(e: React.FormEvent) {
    e.preventDefault()
    const value = code.trim()
    setCode("")
    if (!value) return
    setError("")

    const existing = lines.find(l => l.item.barcode === value.toUpperCase() || l.item.sku === value)
    if (existing) { changeQty(existing.item._id, 1); return }

    const res = await fetch(`/api/admin/stock?code=${encodeURIComponent(value)}`, { credentials: "include" })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setError(data.error || "Item not found"); return }
    if (data.item.stock < 1) { setError(`${data.item.product} (${data.item.size}) is out of stock`); return }
    setLines(prev => [...prev, { item: data.item, quantity: 1 }])
  }

  function changeQty(id: string, delta: number) {
    setLines(prev => prev.flatMap(l => {
      if (l.item._id !== id) return [l]
      const q = l.quantity + delta
      if (q > l.item.stock) { setError(`Only ${l.item.stock} of ${l.item.product} (${l.item.size}) in stock`); return [l] }
      return q > 0 ? [{ ...l, quantity: q }] : []
    }))
    scanRef.current?.focus()
  }

  async function completeSale() {
    if (!lines.length || saving) return
    setSaving(true)
    setError("")
    const res = await fetch("/api/admin/pos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        items: lines.map(l => ({ variantId: l.item._id, quantity: l.quantity })),
        discount: discountValue,
        paymentMethod: payment,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      }),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) { setError(data.error || "Sale failed — nothing was charged to stock"); return }
    setReceipt(data.receipt)
    setLines([]); setDiscount(""); setCustomerName(""); setCustomerPhone("")
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Shop Billing</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Scan items, take payment, stock updates instantly</p>
        </div>
        <Link href="/admin/stock" className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
          <Package className="h-3 w-3" /> Stock
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* Bill */}
        <div className="space-y-3">
          <form onSubmit={onScan} className="flex items-center gap-2 p-3 border border-[#c4956a]/40 bg-[#c4956a]/5">
            <ScanBarcode className="h-5 w-5 text-[#c4956a] flex-shrink-0" />
            <input
              ref={scanRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Scan barcode (or type it and press Enter)"
              autoComplete="off"
              className="flex-1 h-10 px-3 text-sm border border-border bg-background text-foreground focus:outline-none focus:border-[#c4956a]/50"
            />
          </form>

          {error && <p className="text-xs px-3 py-2 border border-red-500/30 bg-red-500/5 text-red-600">{error}</p>}

          <div className="border border-border">
            {lines.length === 0 && <p className="text-xs text-muted-foreground text-center py-12">Scan the first item to start a bill.</p>}
            {lines.map(({ item, quantity }) => (
              <div key={item._id} className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-border last:border-b-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.product}</p>
                  <p className="text-[10px] text-muted-foreground">{item.color} · {item.size} · {inr(item.price)} each · {item.stock} in stock</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => changeQty(item._id, -1)} className="h-7 w-7 flex items-center justify-center border border-border"><Minus className="h-3 w-3" /></button>
                  <span className="w-6 text-center text-sm">{quantity}</span>
                  <button onClick={() => changeQty(item._id, 1)} className="h-7 w-7 flex items-center justify-center border border-border"><Plus className="h-3 w-3" /></button>
                  <span className="w-20 text-right text-sm font-medium text-foreground">{inr(item.price * quantity)}</span>
                  <button onClick={() => changeQty(item._id, -quantity)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="border border-border p-4 space-y-4 h-fit">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Items</span><span>{units}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Discount ₹</span>
              <input type="number" min={0} value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" className="w-24 h-7 px-2 text-right text-xs border border-border bg-background text-foreground" />
            </div>
            <div className="flex justify-between text-lg font-semibold text-foreground pt-2 border-t border-border"><span>Total</span><span>{inr(total)}</span></div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {(["cash", "upi", "card"] as const).map(m => (
              <button key={m} onClick={() => setPayment(m)} className={`h-9 text-[10px] font-medium uppercase border ${payment === m ? "border-[#c4956a] bg-[#c4956a]/10 text-foreground" : "border-border text-muted-foreground"}`}>{m}</button>
            ))}
          </div>

          <div className="space-y-1.5">
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer name (optional)" className="w-full h-8 px-2 text-xs border border-border bg-background text-foreground" />
            <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone (optional)" inputMode="tel" className="w-full h-8 px-2 text-xs border border-border bg-background text-foreground" />
          </div>

          <button onClick={completeSale} disabled={!lines.length || saving} className="w-full h-11 flex items-center justify-center gap-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium uppercase tracking-wider disabled:opacity-30">
            <Check className="h-4 w-4" /> {saving ? "Saving..." : `Complete sale · ${inr(total)}`}
          </button>
        </div>
      </div>

      {receipt && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background border border-border w-full max-w-sm">
            <div className="print-area bg-white text-black p-4 font-mono text-[11px]" style={{ width: "80mm", margin: "0 auto" }}>
              <style>{"@media print { @page { size: 80mm auto; margin: 0 } }"}</style>
              <p className="text-center text-sm font-bold tracking-widest">VCHUKI</p>
              <p className="text-center">Premium Linen · vchuki.com</p>
              <p className="mt-2">Bill #{receipt.billNo}</p>
              <p>{new Date(receipt.date).toLocaleString("en-IN")}</p>
              {receipt.customerName && <p>Customer: {receipt.customerName}</p>}
              <div className="border-t border-dashed border-black my-2" />
              {receipt.items.map((i, n) => (
                <div key={n} className="mb-1">
                  <p>{i.name}</p>
                  <div className="flex justify-between"><span>{i.color} / {i.size} · {i.quantity} × {inr(i.price)}</span><span>{inr(i.price * i.quantity)}</span></div>
                </div>
              ))}
              <div className="border-t border-dashed border-black my-2" />
              <div className="flex justify-between"><span>Subtotal</span><span>{inr(receipt.totalAmount)}</span></div>
              {receipt.discountAmount > 0 && <div className="flex justify-between"><span>Discount</span><span>−{inr(receipt.discountAmount)}</span></div>}
              <div className="flex justify-between font-bold text-sm"><span>TOTAL</span><span>{inr(receipt.finalAmount)}</span></div>
              <p>Paid by {receipt.paymentMethod.toUpperCase()}</p>
              <p className="text-center mt-3">Thank you for shopping with us!</p>
            </div>
            <div className="flex gap-2 p-3 border-t border-border">
              <button onClick={() => window.print()} className="flex-1 h-9 flex items-center justify-center gap-1.5 border border-border text-[10px] font-medium uppercase text-foreground"><Printer className="h-3.5 w-3.5" /> Print receipt</button>
              <button onClick={() => setReceipt(null)} className="flex-1 h-9 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase">New bill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
