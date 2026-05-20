"use client"

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Product cards will go here */}
      <div className="animate-pulse">
        <div className="bg-muted rounded-lg h-80 w-full" />
      </div>
      <div className="animate-pulse">
        <div className="bg-muted rounded-lg h-80 w-full" />
      </div>
      {/* More skeleton items */}
    </div>
  )
}

