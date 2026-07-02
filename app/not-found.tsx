import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found — VCHUKI",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-3">404</p>
        <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">Page Not Found</h1>
        <p className="text-sm text-muted-foreground mt-3">
          This product may have been removed or the URL has changed. Browse our latest collection below.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shirts" className="px-6 py-3 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase">
            Shop Collection
          </Link>
          <Link href="/" className="px-6 py-3 border border-border text-xs font-medium tracking-wider uppercase text-foreground">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
