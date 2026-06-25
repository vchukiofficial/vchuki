import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductVariant from "@/models/ProductVariant"

export const revalidate = 3600 // 1 hour

export async function GET() {
  await connectDB()

  const products = await Product.find({ isActive: true }).lean()
  const allVariants = await ProductVariant.find({ stock: { $gt: 0 } }).lean()

  const variantsByProduct = new Map<string, any[]>()
  for (const v of allVariants) {
    const pid = (v as any).product.toString()
    if (!variantsByProduct.has(pid)) variantsByProduct.set(pid, [])
    variantsByProduct.get(pid)!.push(v)
  }

  let items = ""

  for (const product of products) {
    const p = product as any
    const variants = variantsByProduct.get(p._id.toString()) || []

    if (variants.length === 0) {
      items += generateItem(p, null)
    } else {
      const colorMap = new Map<string, any>()
      for (const v of variants) {
        const vAny = v as any
        const key = `${vAny.color?.name || "Default"}-${vAny.size}`
        if (!colorMap.has(key)) {
          colorMap.set(key, vAny)
        }
      }
      for (const [, variant] of colorMap) {
        items += generateItem(p, variant)
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>VCHUKI - Premium Linen Shirts for Men</title>
    <link>https://vchuki.com</link>
    <description>India's premium linen shirt brand. Handcrafted in Jodhpur, Rajasthan.</description>
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}

function generateItem(product: any, variant: any) {
  const price = variant
    ? product.basePrice + (variant.priceAdjustment || 0)
    : product.basePrice
  const image = variant?.images?.[0] || product.images?.[0] || ""
  const color = variant?.color?.name || ""
  const size = variant?.size || ""
  const id = variant ? `${product._id}-${color}-${size}` : product._id.toString()
  const title = color ? `${product.name} - ${color}${size ? ` (${size})` : ""}` : product.name
  const availability = variant?.stock > 0 ? "in_stock" : "out_of_stock"

  return `    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(product.description || product.name)}</g:description>
      <g:link>https://vchuki.com/product/${escapeXml(product.slug)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:price>${price} INR</g:price>
      ${product.comparePrice ? `<g:sale_price>${price} INR</g:sale_price>` : ""}
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>VCHUKI</g:brand>
      <g:google_product_category>212</g:google_product_category>
      <g:product_type>Apparel &amp; Accessories &gt; Clothing &gt; Shirts &amp; Tops</g:product_type>
      ${color ? `<g:color>${escapeXml(color)}</g:color>` : ""}
      ${size ? `<g:size>${escapeXml(size)}</g:size>` : ""}
      <g:gender>male</g:gender>
      <g:age_group>adult</g:age_group>
      <g:material>Linen Blend</g:material>
      <g:shipping>
        <g:country>IN</g:country>
        <g:price>${price >= 1599 ? "0" : "50"} INR</g:price>
      </g:shipping>
    </item>
`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}
