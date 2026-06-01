import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import CartDrawer from "@/components/layout/CartDrawer"
import MobileNav from "@/components/layout/MobileNav"
import { ShopLayoutWrapper } from "@/components/layout/ShopLayoutWrapper"

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopLayoutWrapper
      navbar={<Navbar />}
      footer={<Footer />}
      cartDrawer={<CartDrawer />}
      mobileNav={<MobileNav />}
    >
      {children}
    </ShopLayoutWrapper>
  )
}
