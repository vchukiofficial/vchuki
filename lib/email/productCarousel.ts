export interface CarouselProduct {
  name: string
  price: number
  image: string
  slug: string
}

/** Email-safe product grid (table-based — flex/grid CSS isn't reliable across email clients). */
export function buildProductCarouselHtml(products: CarouselProduct[]): string {
  if (products.length === 0) return ""

  const cells = products
    .map(
      (p) => `
      <td style="padding:6px;width:${Math.floor(100 / products.length)}%;vertical-align:top;">
        <a href="https://vchuki.com/product/${p.slug}" style="text-decoration:none;">
          <img src="${p.image}" width="140" style="width:100%;max-width:140px;height:auto;display:block;border:1px solid #eee;" />
          <p style="font-size:11px;color:#333;margin:8px 0 2px;line-height:1.3;">${p.name}</p>
          <p style="font-size:13px;font-weight:bold;color:#2a1f14;margin:0;">₹${p.price.toLocaleString("en-IN")}</p>
        </a>
      </td>`
    )
    .join("")

  return `
    <div style="margin:24px 0;">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#c4956a;font-weight:bold;margin:0 0 12px;">Just For You</p>
      <table style="width:100%;border-collapse:collapse;"><tr>${cells}</tr></table>
    </div>`
}
