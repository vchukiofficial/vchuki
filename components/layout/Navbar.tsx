"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, User, Heart, Menu, X, Search, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import SearchOverlay from "./SearchOverlay"
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
      { name: "Half Sleeve", slug: "linen-half-sleeve", image: "/Beige.png" },
      { name: "Full Sleeve", slug: "linen", image: "/skyblue.png" },
    ],
    colors: [
      { name: "Beige", hex: "#d4a574", image: "/Beige.png" },
      { name: "Sky Blue", hex: "#87CEEB", image: "/skyblue.png" },
      { name: "Olive Green", hex: "#6b7c5e", image: "/shortsleevolivegreenshortkurta.png" },
      { name: "Yellow", hex: "#e6c84c", image: "/Yellow.png" },
      { name: "White", hex: "#f5f5f5", image: "/white.png" },
    ],
  },
  {
    label: "Kurta",
    slug: "kurta",
    subcategories: [
      { name: "Half Sleeve", slug: "kurta-half-sleeve", image: "/shortsleevgoldenduneshortkurta.png" },
      { name: "Full Sleeve", slug: "kurta-full-sleeve", image: "/shortsleevolivegreenshortkurta.png" },
    ],
    colors: [
      { name: "Golden Dune", hex: "#c4956a", image: "/shortsleevgoldenduneshortkurta.png" },
      { name: "Olive Green", hex: "#6b7c5e", image: "/shortsleevolivegreenshortkurta.png" },
      { name: "Beige", hex: "#d4a574", image: "/Beige.png" },
    ],
  },
]

export default function Navbar() {
  const { toggleCart, setSearchOpen } = useUIStore()
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
            <button className="hidden md:block" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-[17px] w-[17px] text-muted-foreground hover:text-foreground transition-colors" />
            </button>
            <button className="md:hidden" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="h-[17px] w-[17px] text-muted-foreground hover:text-foreground transition-colors" />
            </button>
            <Link href="/account/wishlist" className="hidden md:block">
              <Heart className="h-[17px] w-[17px] text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
            {session?.user?.role === "admin" && (
              <Link href="/admin" className="hidden md:block text-[11px] uppercase tracking-[0.1em] text-[#c4956a] hover:text-[#d4a574] transition-colors font-medium">
                Admin
              </Link>
            )}
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="absolute left-0 top-0 h-full w-[85vw] max-w-[320px] bg-[#2a1f14] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#c4956a]/15">
                <div className="flex items-center gap-2.5">
                  <Image src="/marko.png" alt="VCHUKI" width={32} height={32} className="invert" />
                  <div>
                    <span className="text-[11px] font-bold tracking-[0.25em] text-[#f5e6d3] block leading-none">VCHUKI</span>
                    <span className="text-[7px] tracking-[0.12em] text-[#c4956a] block mt-0.5">PREMIUM MENSWEAR</span>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="h-8 w-8 flex items-center justify-center border border-[#f5e6d3]/10 text-[#f5e6d3]/60 hover:text-[#f5e6d3]">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation */}
              <div className="p-5">
                {/* Main Links */}
                <div className="space-y-1">
                  <Link
                    href="/shirts"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-3.5 px-4 text-[#f5e6d3] text-sm font-medium tracking-wide hover:bg-[#c4956a]/10 transition-colors"
                  >
                    Shop All
                    <ChevronDown className="h-3.5 w-3.5 text-[#c4956a] -rotate-90" />
                  </Link>

                  {CATEGORIES.map((cat, i) => (
                    <motion.div
                      key={cat.slug}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                    >
                      <div className="py-3 px-4">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#c4956a] font-medium mb-2">{cat.label}</p>
                        <div className="space-y-0.5">
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/shirts/${sub.slug}`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 py-2.5 px-3 text-[#f5e6d3]/70 text-[13px] hover:text-[#f5e6d3] hover:bg-[#c4956a]/5 transition-colors rounded"
                            >
                              <div className="w-8 h-8 rounded border border-[#c4956a]/20 overflow-hidden flex-shrink-0">
                                <Image src={sub.image} alt={sub.name} width={32} height={32} className="object-contain" />
                              </div>
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                        {/* Color dots */}
                        <div className="flex gap-1.5 mt-2 px-3">
                          {cat.colors.slice(0, 5).map((c) => (
                            <div key={c.name} className="w-4 h-4 rounded-full border border-[#f5e6d3]/10" style={{ backgroundColor: c.hex }} title={c.name} />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Divider */}
                <div className="my-5 border-t border-[#c4956a]/15" />

                {/* Secondary Links */}
                <div className="space-y-0.5">
                  {[
                    { href: "/about", label: "Our Story" },
                    { href: "/blog", label: "Journal" },
                    { href: "/contact", label: "Contact" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2.5 px-4 text-[12px] uppercase tracking-[0.12em] text-[#f5e6d3]/40 hover:text-[#f5e6d3]/80 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {session?.user?.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="block py-2.5 px-4 text-[12px] uppercase tracking-[0.12em] text-[#c4956a] font-medium">
                      Admin Panel
                    </Link>
                  )}
                </div>

                {/* Divider */}
                <div className="my-5 border-t border-[#c4956a]/15" />

                {/* CTA */}
                <Link
                  href="/shirts"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full py-3 text-center bg-[#c4956a] text-[#2a1f14] text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-[#d4a574] transition-colors"
                >
                  Shop Collection
                </Link>

                {/* Trust */}
                <div className="mt-6 flex items-center justify-center gap-3 text-[9px] text-[#f5e6d3]/25">
                  <span>Free Shipping ₹1,599+</span>
                  <span className="w-1 h-1 rounded-full bg-[#f5e6d3]/15" />
                  <span>COD Available</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SearchOverlay />
    </>
  )
}
