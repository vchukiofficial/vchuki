"use client"

import { Button } from '@/components/ui/button'

export default function ProductFilters() {
  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit lg:self-start space-y-6">
      <div>
        <h3 className="font-bold text-lg mb-4">Filters</h3>
        
        {/* Price Range */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium">Price</label>
          <div className="w-full h-2 bg-muted rounded-full">
            <div className="h-2 bg-primary rounded-full w-3/4 animate-shimmer" />
          </div>
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>₹0</span>
            <span>₹10,000</span>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium">Color</label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-10 w-10 rounded-full p-0 bg-blue-500 border-2 border-transparent hover:border-blue-300">
              <div className="w-6 h-6 rounded-full bg-blue-500 shadow-sm" />
            </Button>
            <Button variant="outline" size="sm" className="h-10 w-10 rounded-full p-0 bg-black border-2 border-transparent hover:border-gray-300">
              <div className="w-6 h-6 rounded-full bg-black shadow-sm" />
            </Button>
          </div>
        </div>

        <Button className="w-full">Clear All</Button>
      </div>
    </aside>
  )
}

