"use client"
import { useEffect, useState } from "react"
import { Star, Trash2 } from "lucide-react"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch("/api/reviews").then(r => r.json()).then(d => { setReviews(d.reviews || []); setLoading(false) }) }, [])

  async function handleDelete(id: string) {
    await fetch(`/api/reviews/${id}`, { method: "DELETE" })
    setReviews(reviews.filter(r => r._id !== id))
  }

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-semibold tracking-tight">Reviews</h1><p className="text-xs text-muted-foreground mt-0.5">{reviews.length} customer reviews</p></div>
      <div className="space-y-2">
        {reviews.map(r => (
          <div key={r._id} className="p-4 rounded-lg border bg-card flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex">{Array.from({length:5},(_,i) => <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-accent text-accent" : "text-muted-foreground/20"}`} />)}</div>
                <span className="text-xs font-medium">{r.user?.name || "User"}</span>
                {r.verifiedPurchase && <span className="text-[9px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded">Verified</span>}
              </div>
              <p className="text-[11px] text-accent mt-0.5">{r.product?.name || "Product"}</p>
              {r.comment && <p className="text-xs text-muted-foreground mt-1.5">{r.comment}</p>}
            </div>
            <button onClick={() => handleDelete(r._id)} className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
