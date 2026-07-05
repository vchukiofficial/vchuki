"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag,
  Star, Truck, BarChart3, Settings, ArrowLeft, LogOut,
  Megaphone, RotateCcw, Box, Zap, Mail, PackageX, Crown, Video,
  Menu, X, MoreHorizontal
} from "lucide-react"
import { signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

const nav = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/shipments", icon: Box, label: "Shipments" },
  { href: "/admin/delivery", icon: Truck, label: "Delivery" },
  { href: "/admin/returns", icon: RotateCcw, label: "Returns" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/stock", icon: PackageX, label: "Stock" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/vip", icon: Crown, label: "VIP Waitlist" },
  { href: "/admin/reviews", icon: Star, label: "Reviews" },
  { href: "/admin/coupons", icon: Tag, label: "Coupons" },
  { href: "/admin/combo-offers", icon: Zap, label: "Combo Offers" },
  { href: "/admin/campaigns", icon: Megaphone, label: "Campaigns" },
  { href: "/admin/communications", icon: Mail, label: "Communications" },
  { href: "/admin/email-templates", icon: Mail, label: "Email Templates" },
  { href: "/admin/hero-videos", icon: Video, label: "Hero Videos" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
  if (!session || session.user?.role !== "admin") redirect("/auth/login")

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col fixed h-full border-r border-border bg-card/50">
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to Store
          </Link>
          <p className="mt-2 text-sm font-bold tracking-[0.2em] text-foreground">VCHUKI</p>
          <p className="text-[8px] tracking-[0.12em] text-[#c4956a]">ADMIN PANEL</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-auto">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors ${
                  active ? "bg-[#c4956a]/10 text-foreground font-medium border-l-2 border-[#c4956a] -ml-[1px]" : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-7 w-7 rounded-full bg-[#c4956a]/10 flex items-center justify-center text-[10px] font-bold text-[#c4956a]">
              {session.user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-foreground">{session.user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{session.user?.email}</p>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 border-b border-border bg-background/98 backdrop-blur-md flex items-center justify-between px-4">
        <button onClick={() => setMobileMenuOpen(true)} aria-label="Menu" className="text-foreground">
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold tracking-[0.15em] text-foreground">VCHUKI</span>
        <Link href="/" className="text-[10px] text-[#c4956a] uppercase tracking-wider font-medium">Store →</Link>
      </div>

      {/* Mobile Menu Drawer - all nav items */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="absolute left-0 top-0 h-full w-[80vw] max-w-[300px] bg-background border-r border-border overflow-y-auto"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold tracking-[0.2em] text-foreground">VCHUKI</p>
                  <p className="text-[8px] tracking-[0.12em] text-[#c4956a]">ADMIN PANEL</p>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="h-8 w-8 flex items-center justify-center border border-border text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="p-2 space-y-0.5">
                {nav.map((item) => {
                  const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-[13px] transition-colors ${
                        active ? "bg-[#c4956a]/10 text-foreground font-medium border-l-2 border-[#c4956a] -ml-[1px]" : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
                      }`}
                    >
                      <item.icon className="h-4 w-4" strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <div className="h-7 w-7 rounded-full bg-[#c4956a]/10 flex items-center justify-center text-[10px] font-bold text-[#c4956a]">
                    {session?.user?.name?.charAt(0) || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-foreground">{session?.user?.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{session?.user?.email}</p>
                  </div>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="text-muted-foreground hover:text-foreground transition-colors">
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-56 pt-12 md:pt-0 pb-16 md:pb-0">
        <div className="p-4 md:p-6 max-w-7xl">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/98 backdrop-blur-md">
        <div className="grid grid-cols-5 h-14">
          {nav.slice(0, 4).map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center gap-0.5 ${active ? "text-[#c4956a]" : "text-muted-foreground"}`}>
                <item.icon className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-[8px] font-medium">{item.label}</span>
              </Link>
            )
          })}
          <button onClick={() => setMobileMenuOpen(true)} className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-[8px] font-medium">More</span>
          </button>
        </div>
      </div>
    </div>
  )
}
