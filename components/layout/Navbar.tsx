"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, User, Heart, Menu, X, Search } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useUIStore } from "@/store/uiStore"
import { useCartStore } from "@/store/cartStore"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
  const { toggleCart } = useUIStore()
  const items = useCartStore((s) => s.items)
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-background/98 backdrop-blur-md border-b shadow-sm" : "bg-transparent border-b border-transparent"}`}>
        {/* Top announcement bar */}
        <div className="bg-[#2a1f14] text-[#f5e6d3] text-center py-1.5">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-medium">
            Free Shipping on Orders Above ₹999 • Premium Linen Collection Live
          </p>
        </div>

        <div className="container flex h-14 md:h-16 items-center justify-between">
          {/* Left - Mobile menu + Nav */}
          <div className="flex items-center gap-5 w-1/3">
            <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <Menu className="h-5 w-5 text-foreground/80" />
            </button>
            <div className="hidden md:flex items-center gap-7">
              <Link href="/shirts" className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors font-medium">Shop</Link>
              <Link href="/shirts/linen" className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors font-medium">Linen</Link>
              <Link href="/shirts/formal" className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors font-medium">Formal</Link>
              <Link href="/shirts/casual" className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors font-medium">Casual</Link>
              <Link href="/about" className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors font-medium">Story</Link>
            </div>
          </div>

          {/* Center - Logo */}
          <Link href="/" className="flex flex-col items-center group">
            <Image src="/logo-mark.svg" alt="VCHUKI" width={28} height={28} className="dark:invert" />
            <span className="text-[11px] font-bold tracking-[0.3em] mt-0.5 text-foreground">VCHUKI</span>
          </Link>

          {/* Right - Actions */}
          <div className="flex items-center justify-end gap-4 w-1/3">
            <ThemeToggle />
            <button className="hidden md:block" aria-label="Search">
              <Search className="h-[17px] w-[17px] text-muted-foreground hover:text-foreground transition-colors" />
            </button>
            <Link href="/account/wishlist" className="hidden md:block">
              <Heart className="h-[17px] w-[17px] text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
            {session ? (
              <Link href="/account">
                <User className="h-[17px] w-[17px] text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
            ) : (
              <Link href="/auth/login" className="hidden md:block text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors font-medium">
                Login
              </Link>
            )}
            <button onClick={toggleCart} className="relative" aria-label="Cart">
              <ShoppingCart className="h-[17px] w-[17px] text-muted-foreground hover:text-foreground transition-colors" />
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#c4956a] text-white text-[8px] font-bold flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-full w-80 bg-background p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <span className="text-sm font-bold tracking-[0.25em] block">VCHUKI</span>
                  <span className="text-[8px] tracking-[0.15em] text-muted-foreground">PREMIUM MENSWEAR</span>
                </div>
                <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-5">
                {[
                  { href: "/shirts", label: "Shop All" },
                  { href: "/shirts/linen", label: "Linen Collection" },
                  { href: "/shirts/formal", label: "Formal" },
                  { href: "/shirts/casual", label: "Casual" },
                  { href: "/shirts/cotton", label: "Cotton" },
                  { href: "/shirts/premium", label: "Premium" },
                  { href: "/shirts/oversized", label: "Oversized" },
                ].map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link href={item.href} onClick={() => setMobileOpen(false)} className="block text-sm tracking-wide text-foreground/80 hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="border-t border-[#c4956a]/20 pt-5 mt-6 space-y-4">
                  <Link href="/about" onClick={() => setMobileOpen(false)} className="block text-xs uppercase tracking-[0.12em] text-muted-foreground">Our Story</Link>
                  <Link href="/blog" onClick={() => setMobileOpen(false)} className="block text-xs uppercase tracking-[0.12em] text-muted-foreground">Journal</Link>
                  <Link href="/contact" onClick={() => setMobileOpen(false)} className="block text-xs uppercase tracking-[0.12em] text-muted-foreground">Contact</Link>
                  {session?.user?.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="block text-xs uppercase tracking-[0.12em] text-[#c4956a] font-medium">Admin</Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
