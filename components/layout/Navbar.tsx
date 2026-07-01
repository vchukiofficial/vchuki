"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, User, Heart, Menu, X, Search, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useUIStore } from "@/store/uiStore"
import { useCartStore } from "@/store/cartStore"
import { useSession } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

const CATEGORIES = [
  {
    label: "Shirts",
    slug: "shirts",
    subcategories: [
      { name: "Half Sleeve", slug: "linen-half-sleeve", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/beige.png" },
      { name: "Full Sleeve", slug: "linen", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/skyblue.png" },
    ],
    colors: [
      { name: "Beige", hex: "#d4a574", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/beige.png" },
      { name: "Sky Blue", hex: "#87CEEB", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/skyblue.png" },
      { name: "Olive Green", hex: "#6b7c5e", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/olive-green.png" },
      { name: "Yellow", hex: "#e6c84c", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/yellow.png" },
      { name: "White", hex: "#f5f5f5", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/white.png" },
    ],
  },
  {
    label: "Kurta",
    slug: "kurta",
    subcategories: [
      { name: "Half Sleeve", slug: "kurta-half-sleeve", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/shortsleevgoldenduneshortkurta.png" },
      { name: "Full Sleeve", slug: "kurta-full-sleeve", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/fullsleevolivegreenshortshirts.png" },
    ],
    colors: [
      { name: "Golden Dune", hex: "#c4956a", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/shortsleevgoldenduneshortkurta.png" },
      { name: "Olive Green", hex: "#6b7c5e", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/fullsleevolivegreenshortshirts.png" },
      { name: "Beige", hex: "#d4a574", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/beige.png" },
    ],
  },
]

export default function Navbar() {
  const { toggleCart } = useUIStore()
  const items = useCartStore((s) => s.items)
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<Record<string, number>>({})
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  function openDropdown(slug: string) {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current)
    setActiveDropdown(slug)
  }

  function closeDropdown() {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 200)
  }

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-background/98 backdrop-blur-md border-b shadow-sm" : "bg-transparent border-b border-transparent"}`}>
        {/* Top announcement bar */}
        <div className="bg-[#2a1f14] text-[#f5e6d3] text-center py-1.5 px-4">
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.15em] md:tracking-[0.2em] font-medium truncate">
            ✨ Archive Debut Dropping July 7th • Join the VIP Waitlist
          </p>
        </div>

        <div className="container flex h-14 md:h-16 items-center justify-between">
          {/* Left - Mobile menu + Nav */}
          <div className="flex items-center gap-5 w-1/3">
            <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <Menu className="h-5 w-5 text-foreground/80" />
            </button>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/shirts" className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors font-medium">Shop</Link>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.slug}
                  className="relative"
                  onMouseEnter={() => openDropdown(cat.slug)}
                  onMouseLeave={closeDropdown}
                >
                  <button
                    className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors font-medium inline-flex items-center gap-0.5"
                  >
                    {cat.label}
                    <ChevronDown className={`h-3 w-3 transition-transform ${activeDropdown === cat.slug ? "rotate-180" : ""}`} />
                  </button>

                  {/* Mega Dropdown */}
                  <AnimatePresence>
                    {activeDropdown === cat.slug && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[380px] bg-background border border-border shadow-xl p-5 z-50"
                        onMouseEnter={() => openDropdown(cat.slug)}
                        onMouseLeave={closeDropdown}
                      >
                        {/* Subcategories with images */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {cat.subcategories.map((sub) => (
                            <Link key={sub.slug} href={`/shirts/${sub.slug}`} className="group block">
                              <div className="relative aspect-[3/4] bg-gradient-to-b from-card/50 to-background border border-border overflow-hidden group-hover:border-[#c4956a]/40 transition-colors">
                                <Image
                                  src={sub.image}
                                  alt={sub.name}
                                  fill
                                  className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                                  sizes="160px"
                                />
                              </div>
                              <p className="text-[10px] uppercase tracking-wider text-center mt-2 font-medium text-muted-foreground group-hover:text-foreground transition-colors">{sub.name}</p>
                            </Link>
                          ))}
                        </div>

                        {/* Color Variants */}
                        <div className="flex items-center gap-2 mb-3 pt-3 border-t border-border">
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Colors:</span>
                          <div className="flex gap-1.5">
                            {cat.colors.map((color, idx) => (
                              <button
                                key={color.name}
                                onMouseEnter={() => setSelectedColor((p) => ({ ...p, [cat.slug]: idx }))}
                                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 ${(selectedColor[cat.slug] || 0) === idx ? "border-[#c4956a] scale-110" : "border-border"}`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>

                        {/* CTA */}
                        <Link
                          href="/shirts"
                          className="block w-full py-2.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-center text-[10px] font-medium tracking-wider uppercase hover:opacity-90 transition-opacity"
                        >
                          View All {cat.label}
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Center - Logo */}
          <Link href="/" className="flex flex-col items-center group">
            <Image src="/marko.png" alt="VCHUKI" width={44} height={44} className="dark:invert" />
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
              className="absolute left-0 top-0 h-full w-80 bg-background p-6 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <span className="text-sm font-bold tracking-[0.25em] block">VCHUKI</span>
                  <span className="text-[8px] tracking-[0.15em] text-muted-foreground">PREMIUM MENSWEAR</span>
                </div>
                <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-6">
                <Link href="/shirts" onClick={() => setMobileOpen(false)} className="block text-sm tracking-wide text-foreground/80 hover:text-foreground font-medium">
                  Shop All
                </Link>
                {CATEGORIES.map((cat, i) => (
                  <motion.div
                    key={cat.slug}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <p className="text-sm tracking-wide text-foreground font-medium mb-2">{cat.label}</p>
                    <div className="ml-3 space-y-2">
                      {cat.subcategories.map((sub) => (
                        <Link key={sub.slug} href={`/shirts/${sub.slug}`} onClick={() => setMobileOpen(false)} className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                    {/* Color swatches in mobile */}
                    <div className="flex gap-2 ml-3 mt-2">
                      {cat.colors.map((c) => (
                        <div key={c.name} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c.hex }} title={c.name} />
                      ))}
                    </div>
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
