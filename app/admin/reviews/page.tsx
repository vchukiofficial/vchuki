"use client"

import { useEffect, useState } from "react"
import { Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Review {
  _id: string
  rating: number
  comment?: string
  verifiedPurchase: boolean
  createdAt: string
  user: { name: string } | null
  product: { name: string; slug: string } | null
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => { setReviews(data.reviews || []); setLoading(false) })
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" })
    if (res.ok) {
      setReviews(reviews.filter((r) => r._id !== id))
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading reviews...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews ({reviews.length})</h1>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review._id} className="p-4 rounded-lg border border-border/50 bg-card/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{review.user?.name || "Unknown"}</span>
                    {review.verifiedPurchase && (
                      <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Verified</span>
                    )}
                  </div>
                  <p className="text-xs text-primary mt-1">Product: {review.product?.name || "Unknown"}</p>
                  {review.comment && <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>}
                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive h-8 w-8"
                  onClick={() => handleDelete(review._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
