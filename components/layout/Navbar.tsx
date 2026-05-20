"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, User, Heart, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useUIStore } from "@/store/uiStore"
import { useCartStore } from "@/store/cartStore"
import { useSession } from "next-auth/react"
import { useState } from "react"

export default function Navbar() {
  const { toggleCart } = useUIStore()
  const items = useCartStore((s) => s.items)
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container flex h-12 md:h-14 items-center justify-between">
          {/* Left - Mobile menu */}
          <div className="flex items-center gap-4 w-1/3">
            <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/shirts" className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
              <Link href="/shirts/formal" className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground transition-colors">Formal</Link>
              <Link href="/shirts/casual" className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground transition-colors">Casual</Link>
              <Link href="/shirts/linen" className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground transition-colors">Linen</Link>
            </div>
          </div>

          {/* Center - Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-mark.svg" alt="VCHUKI" width={24} height={24} className="dark:invert" />
            <div className="hidden sm:block">
              <span className="text-sm font-semibold tracking-[0.2em] block leading-none">VCHUKI</span>
              <span className="text-[7px] tracking-[0.15em] text-muted-foreground block mt-0.5">PREMIUM MENSWEAR</span>
            </div>
          </Link>

          {/* Right - Actions */}
          <div className="flex items-center justify-end gap-3 w-1/3">
            <ThemeToggle />
            <Link href="/account/wishlist" className="hidden md:block">
              <Heart className="h-[18px] w-[18px] text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
            {session ? (
              <Link href="/account">
                <User className="h-[18px] w-[18px] text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
            ) : (
              <Link href="/auth/login" className="hidden md:block text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
            )}
            <button onClick={toggleCart} className="relative" aria-label="Cart">
              <ShoppingCart className="h-[18px] w-[18px] text-muted-foreground hover:text-foreground transition-colors" />
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-foreground text-background text-[8px] font-medium flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-background p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-semibold tracking-[0.18em]">VCHUKI</span>
              <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              {[
                { href: "/shirts", label: "Shop All" },
                { href: "/shirts/formal", label: "Formal" },
                { href: "/shirts/casual", label: "Casual" },
                { href: "/shirts/linen", label: "Linen" },
                { href: "/shirts/cotton", label: "Cotton" },
                { href: "/shirts/premium", label: "Premium" },
                { href: "/shirts/oversized", label: "Oversized" },
                { href: "/shirts/ethnic", label: "Ethnic" },
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block text-sm tracking-wide text-muted-foreground hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ))}
              <div className="border-t pt-4 mt-4 space-y-3">
                <Link href="/about" onClick={() => setMobileOpen(false)} className="block text-xs uppercase tracking-[0.1em] text-muted-foreground">About</Link>
                <Link href="/blog" onClick={() => setMobileOpen(false)} className="block text-xs uppercase tracking-[0.1em] text-muted-foreground">Blog</Link>
                <Link href="/contact" onClick={() => setMobileOpen(false)} className="block text-xs uppercase tracking-[0.1em] text-muted-foreground">Contact</Link>
                {session?.user?.role === "admin" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="block text-xs uppercase tracking-[0.1em] text-accent font-medium">Admin</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
