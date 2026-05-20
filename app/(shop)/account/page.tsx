"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, Heart, MapPin, LogOut, LayoutDashboard, Users, Tag, Star, Truck, ShoppingCart } from "lucide-react"
import { redirect } from "next/navigation"

export default function AccountPage() {
  const { data: session, status } = useSession()

  if (status === "loading") return <div className="container py-20 text-center text-muted-foreground">Loading...</div>
  if (!session) redirect("/auth/login")

  const isAdmin = session.user?.role === "admin"

  const userMenus = [
    { href: "/account/orders", icon: Package, label: "My Orders", desc: "Track and manage your orders" },
    { href: "/account/wishlist", icon: Heart, label: "Wishlist", desc: "Your saved items" },
    { href: "/account/addresses", icon: MapPin, label: "Addresses", desc: "Manage delivery addresses" },
  ]

  const adminMenus = [
    { href: "/admin", icon: LayoutDashboard, label: "Admin Dashboard", desc: "Overview & analytics" },
    { href: "/admin/products", icon: Package, label: "Manage Products", desc: "Add, edit, delete products" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Manage Orders", desc: "View & update order status" },
    { href: "/admin/delivery", icon: Truck, label: "Delivery Management", desc: "Track shipments & delivery" },
    { href: "/admin/users", icon: Users, label: "Manage Users", desc: "Roles & permissions" },
    { href: "/admin/coupons", icon: Tag, label: "Manage Coupons", desc: "Create & manage discounts" },
    { href: "/admin/reviews", icon: Star, label: "Manage Reviews", desc: "Moderate customer reviews" },
  ]

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{session.user?.name}</h1>
          <p className="text-sm text-muted-foreground">{session.user?.email}</p>
          {isAdmin && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">Administrator</span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className="text-muted-foreground">
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">Admin Panel</h2>
          <div className="grid gap-2">
            {adminMenus.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* User Section */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">My Account</h2>
        <div className="grid gap-2">
          {userMenus.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/30 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
