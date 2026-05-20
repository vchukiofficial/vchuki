import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t bg-card/50 pb-20 md:pb-6">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-bold text-gradient mb-2">VCHUKI</h3>
            <p className="text-xs text-muted-foreground">Premium fashion for the modern individual.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">Shop</h4>
            <div className="space-y-1.5 text-sm">
              <Link href="/products" className="block text-muted-foreground hover:text-foreground transition-colors">All Products</Link>
              <Link href="/products?category=formal" className="block text-muted-foreground hover:text-foreground transition-colors">Formal</Link>
              <Link href="/products?category=casual" className="block text-muted-foreground hover:text-foreground transition-colors">Casual</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">Account</h4>
            <div className="space-y-1.5 text-sm">
              <Link href="/account" className="block text-muted-foreground hover:text-foreground transition-colors">My Account</Link>
              <Link href="/account/orders" className="block text-muted-foreground hover:text-foreground transition-colors">Orders</Link>
              <Link href="/account/wishlist" className="block text-muted-foreground hover:text-foreground transition-colors">Wishlist</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">Support</h4>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>support@vchuki.com</p>
              <p>+91 98765 43210</p>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t text-center text-[10px] md:text-xs text-muted-foreground">
          © 2026 VCHUKI. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
