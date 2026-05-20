"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag,
  Star, Truck, BarChart3, Settings, ArrowLeft, LogOut
} from "lucide-react"
import { signOut } from "next-auth/react"

const nav = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/delivery", icon: Truck, label: "Delivery" },
  { href: "/admin/coupons", icon: Tag, label: "Coupons" },
  { href: "/admin/reviews", icon: Star, label: "Reviews" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
  if (!session || session.user?.role !== "admin") redirect("/auth/login")

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col fixed h-full border-r bg-card/50">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to Store
          </Link>
          <p className="mt-2 text-sm font-semibold tracking-[0.15em]">VCHUKI</p>
          <p className="text-[8px] tracking-[0.1em] text-muted-foreground">PREMIUM MENSWEAR</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-auto">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
                  active ? "bg-foreground/5 text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
                }`}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.5} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-7 w-7 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-medium">
              {session.user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{session.user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{session.user?.email}</p>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 border-b bg-background/95 backdrop-blur-md flex items-center justify-between px-4">
        <span className="text-sm font-semibold tracking-[0.12em]">VCHUKI Admin</span>
        <Link href="/" className="text-xs text-muted-foreground">Store →</Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-56 pt-12 md:pt-0">
        <div className="p-4 md:p-6 max-w-7xl">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md">
        <div className="grid grid-cols-5 h-14">
          {nav.slice(0, 5).map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center gap-0.5 ${active ? "text-foreground" : "text-muted-foreground"}`}>
                <item.icon className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-[8px]">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
