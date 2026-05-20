import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 pb-24 md:pb-8">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gradient mb-4">VCHUKI</h3>
            <p className="text-sm text-muted-foreground">Premium fashion for the modern individual.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Shop</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/products" className="block hover:text-foreground transition-colors">All Products</Link>
              <Link href="/products?category=formal" className="block hover:text-foreground transition-colors">Formal</Link>
              <Link href="/products?category=casual" className="block hover:text-foreground transition-colors">Casual</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Account</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/account" className="block hover:text-foreground transition-colors">My Account</Link>
              <Link href="/account/orders" className="block hover:text-foreground transition-colors">Orders</Link>
              <Link href="/account/wishlist" className="block hover:text-foreground transition-colors">Wishlist</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Support</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>support@vchuki.com</p>
              <p>+91 98765 43210</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          © 2026 VCHUKI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
