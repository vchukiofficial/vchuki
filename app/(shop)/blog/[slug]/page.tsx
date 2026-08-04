import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import connectDB from "@/lib/mongodb"
import Blog from "@/models/Blog"
import "@/models/Product" // registers the Product model so .populate("relatedProducts") resolves
import { ArrowRight } from "lucide-react"

// Static fallback articles (for when DB has no content yet)
const STATIC_ARTICLES: Record<string, { title: string; description: string; content: string; date: string; category: string; readTime?: string }> = {
  "best-linen-shirts-for-indian-summers": {
    title: "Best Linen Shirts for Indian Summers 2026",
    description: "Discover why linen is the ultimate fabric for Indian heat. Our guide to choosing, styling, and caring for linen shirts.",
    date: "2026-06-15",
    category: "Fabric Guide",
    readTime: "5 min",
    content: `<h2>Why Linen is Perfect for Indian Summers</h2><p>When temperatures cross 40°C, linen becomes your best friend. Its natural fibers allow maximum airflow, wick moisture instantly, and keep you cool all day. VCHUKI's premium linen blend shirts are specifically designed for the Indian climate — breathable, soft, and naturally textured.</p><h2>How to Choose the Right Linen Shirt</h2><p>Look for a linen-cotton blend (60/40 or 70/30) for the perfect balance of breathability and structure. Pure linen wrinkles more but breathes better. VCHUKI uses a premium blend that gives you the best of both worlds.</p><h2>Styling Your Linen Shirt</h2><p>For a casual look, wear it untucked with chinos or shorts. For semi-formal, tuck it into tailored trousers. Roll the sleeves once for an effortless vibe. Our shirts come in 5 Rajasthan-inspired colors that pair with everything.</p><h2>Care Tips</h2><p>Wash in cold water, hang dry in shade, and embrace the natural wrinkles — they're part of linen's charm. Iron while slightly damp for a crisp finish. Your VCHUKI linen shirt gets softer with every wash.</p>`,
  },
  "linen-vs-cotton-shirts": {
    title: "Linen vs Cotton: Which Fabric Wins for Summer?",
    description: "Detailed comparison of linen and cotton shirts for Indian weather. Breathability, comfort, durability, and styling tips.",
    date: "2026-06-10",
    category: "Fabric Guide",
    readTime: "4 min",
    content: `<h2>The Great Fabric Debate</h2><p>When temperatures soar in Indian summers, choosing the right shirt fabric is crucial. Both linen and cotton have strengths, but which one is truly better for our climate?</p><h2>Linen: The Summer Champion</h2><p>Linen is made from flax fibers and is naturally the most breathable fabric available. It absorbs moisture quickly and dries fast, making it ideal for humid Indian summers.</p><p><strong>Pros:</strong> Extremely breathable, gets softer with washes, natural texture looks premium, eco-friendly.</p><h2>Cotton: The All-Rounder</h2><p>Cotton is versatile, comfortable, and available in countless weaves. From crisp poplin to soft Oxford, cotton adapts to every occasion.</p><p><strong>Pros:</strong> Wrinkle-resistant options available, soft from day one, huge variety, easy to maintain.</p><h2>Our Recommendation</h2><p>For peak summer (April-June): Choose linen. For monsoon: Cotton works perfectly. For year-round: A cotton-linen blend like VCHUKI's premium fabric offers the best of both worlds — breathable yet structured.</p>`,
  },
  "how-to-style-short-kurta": {
    title: "How to Style a Short Kurta for Every Occasion",
    description: "From festivals to office Fridays — learn how to style your linen short kurta with confidence.",
    date: "2026-06-05",
    category: "Style Tips",
    readTime: "4 min",
    content: `<h2>The Modern Short Kurta</h2><p>The short kurta is the perfect fusion of Indian heritage and modern fashion. VCHUKI's linen short kurtas are designed to be versatile — wear them to the office, festivals, or casual outings.</p><h2>For the Office</h2><p>Pair a neutral-toned short kurta (beige, white, or olive) with tailored chinos and leather sandals or loafers. Keep accessories minimal — a watch and simple bracelet work perfectly.</p><h2>For Festivals & Celebrations</h2><p>Go bold with Golden Dune or Royal Indigo. Pair with white churidar or slim-fit pants. Add a statement watch and kolhapuri chappals for the complete look.</p><h2>Weekend Casual</h2><p>Wear it loose over shorts or joggers. Roll the sleeves, add sunglasses, and you're ready for brunch, beach, or a casual hangout. The linen fabric keeps you cool all day.</p>`,
  },
  "jodhpur-textile-heritage": {
    title: "The Textile Heritage of Jodhpur: Why We Craft Here",
    description: "Explore Jodhpur's rich textile history and why VCHUKI chose this city as our home for handcrafted menswear.",
    date: "2026-05-28",
    category: "Heritage",
    readTime: "6 min",
    content: `<h2>Jodhpur: The Blue City of Textiles</h2><p>Jodhpur isn't just famous for its blue houses and Mehrangarh Fort. For centuries, it has been a hub of textile craftsmanship — from bandhani to block printing, from fine cotton weaving to premium linen processing.</p><h2>Why VCHUKI Chose Jodhpur</h2><p>We chose Jodhpur because of its unmatched textile heritage. The artisans here have generations of knowledge in fabric handling, stitching precision, and quality control. Every VCHUKI shirt benefits from this inherited expertise.</p><h2>Our 47 Quality Checks</h2><p>Inspired by Jodhpur's tradition of perfection, every VCHUKI shirt passes through 47 quality checkpoints — from fabric inspection to final packaging. This isn't just a number; it's our commitment to the heritage of this city.</p><h2>Supporting Local Artisans</h2><p>By manufacturing in Jodhpur, we support local artisan families and keep traditional textile skills alive. When you buy a VCHUKI shirt, you're supporting Rajasthan's craft heritage.</p>`,
  },
  "summer-fashion-trends-2026": {
    title: "Summer Fashion Trends 2026: What's Hot This Season",
    description: "Stay ahead with the latest summer fashion trends for men. Colors, patterns, and styles dominating 2026.",
    date: "2026-05-20",
    category: "Trends",
    readTime: "5 min",
    content: `<h2>2026 Summer Trends for Men</h2><p>This summer is all about effortless sophistication. The key trends combine comfort with style, making it easier than ever to look put-together in the heat.</p><h2>Trending Colors</h2><p>Earth tones dominate — sage green, terracotta, sand beige, and dusty blue. These natural hues pair beautifully with both light and dark bottoms. VCHUKI's 5 curated colors are perfectly aligned with this trend.</p><h2>Fabric is King</h2><p>Premium natural fabrics are replacing synthetics. Linen, organic cotton, and bamboo blends are what style-conscious men are choosing. Breathability and sustainability matter more than ever.</p><h2>The Relaxed Fit</h2><p>The oversized trend is maturing into a "relaxed fit" — not baggy, but comfortably loose. Structured shoulders with a slightly wider body for airflow. VCHUKI's regular fit hits this sweet spot perfectly.</p>`,
  },
}

interface Props {
  params: { slug: string }
}

export const revalidate = 60

function slugifyHeading(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Injects id="" anchors into every <h2> in the article body and returns a
// table-of-contents list built from the same headings, so long guides get
// jump links and a scannable outline instead of a wall of text.
function addHeadingAnchors(html: string): { html: string; toc: { id: string; text: string }[] } {
  const toc: { id: string; text: string }[] = []
  const usedIds = new Set<string>()

  const annotated = html.replace(/<h2>(.*?)<\/h2>/g, (_match, inner: string) => {
    const base = slugifyHeading(inner) || "section"
    let id = base
    let n = 2
    while (usedIds.has(id)) id = `${base}-${n++}`
    usedIds.add(id)
    toc.push({ id, text: inner.replace(/<[^>]*>/g, "") })
    return `<h2 id="${id}">${inner}</h2>`
  })

  return { html: annotated, toc }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB()
  const dbArticle = await Blog.findOne({ slug: params.slug, isPublished: true }).lean() as any
  const article = dbArticle || STATIC_ARTICLES[params.slug]
  if (!article) return { title: "Not Found" }

  const ogImage = dbArticle?.coverImage || "https://vchuki.com/og-image.png"

  return {
    title: dbArticle ? (dbArticle.seoTitle || dbArticle.title) : article.title,
    description: dbArticle ? (dbArticle.seoDescription || dbArticle.description) : article.description,
    keywords: dbArticle?.seoKeywords?.length ? dbArticle.seoKeywords : undefined,
    alternates: { canonical: `https://vchuki.com/blog/${params.slug}` },
    openGraph: {
      title: (dbArticle?.seoTitle || article.title) + " | VCHUKI Journal",
      description: dbArticle?.seoDescription || article.description,
      url: `https://vchuki.com/blog/${params.slug}`,
      type: "article",
      publishedTime: dbArticle?.createdAt || article.date,
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: dbArticle?.seoDescription || article.description,
      images: [ogImage],
    },
  }
}

export default async function BlogArticlePage({ params }: Props) {
  await connectDB()
  const dbArticle = await Blog.findOne({ slug: params.slug, isPublished: true })
    .populate("relatedProducts", "name slug images basePrice")
    .lean() as any
  const staticArticle = STATIC_ARTICLES[params.slug]

  if (!dbArticle && !staticArticle) notFound()

  const title = dbArticle?.title || staticArticle?.title
  const rawContent: string = dbArticle?.content || staticArticle?.content || ""
  const category = dbArticle?.category || staticArticle?.category
  const date = dbArticle ? new Date(dbArticle.createdAt).toISOString().split("T")[0] : staticArticle?.date
  const updatedDate = dbArticle?.updatedAt ? new Date(dbArticle.updatedAt).toISOString().split("T")[0] : date
  const description = dbArticle?.seoDescription || dbArticle?.excerpt || staticArticle?.description
  const author = dbArticle?.author || "VCHUKI Team"
  const readTime = dbArticle?.readTime || staticArticle?.readTime || "5 min"
  const coverImage: string | undefined = dbArticle?.coverImage
  const tags: string[] = dbArticle?.tags || []
  const relatedProducts: any[] = dbArticle?.relatedProducts || []

  const { html: content, toc } = addHeadingAnchors(rawContent)
  const wordCount = rawContent.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length

  const relatedPosts = category
    ? await Blog.find({ category, slug: { $ne: params.slug }, isPublished: true })
        .select("slug title excerpt")
        .limit(3)
        .lean()
    : []

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: [coverImage || "https://vchuki.com/og-image.png"],
    datePublished: date,
    dateModified: updatedDate,
    author: { "@type": "Organization", name: author, url: "https://vchuki.com" },
    publisher: {
      "@type": "Organization",
      name: "VCHUKI",
      logo: { "@type": "ImageObject", url: "https://vchuki.com/logo.svg" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://vchuki.com/blog/${params.slug}` },
    articleSection: category,
    keywords: dbArticle?.seoKeywords?.length ? dbArticle.seoKeywords.join(", ") : tags.join(", ") || undefined,
    wordCount,
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://vchuki.com" },
      { "@type": "ListItem", position: 2, name: "Journal", item: "https://vchuki.com/blog" },
      { "@type": "ListItem", position: 3, name: title, item: `https://vchuki.com/blog/${params.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <article className="container py-6 md:py-10 px-5 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="mx-1.5 text-border">/</span>
          <Link href="/blog" className="hover:text-foreground transition-colors">Journal</Link>
          <span className="mx-1.5 text-border">/</span>
          <span className="text-foreground">{category}</span>
        </nav>

        {/* Header */}
        <header className="mb-8 md:mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-[#c4956a]/10 text-[#c4956a] text-[10px] font-medium uppercase tracking-wider">{category}</span>
            <span className="text-[10px] text-muted-foreground">{date}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-foreground leading-snug">{title}</h1>
          <p className="text-xs text-muted-foreground mt-3">
            By {author} · {readTime} read
            {updatedDate && updatedDate !== date ? ` · Updated ${updatedDate}` : ""}
          </p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {tags.map((tag) => (
                <span key={tag} className="text-[10px] text-muted-foreground border border-border px-2 py-0.5">#{tag}</span>
              ))}
            </div>
          )}
        </header>

        {/* Cover image */}
        {coverImage && (
          <div className="relative aspect-[16/9] w-full mb-8 md:mb-10 overflow-hidden bg-card">
            <Image src={coverImage} alt={title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
          </div>
        )}

        {/* Table of contents */}
        {toc.length >= 2 && (
          <nav aria-label="Table of contents" className="mb-10 p-5 border border-border bg-card/40">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#c4956a] font-medium mb-3">In This Article</p>
            <ol className="space-y-1.5">
              {toc.map((item, i) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-sm text-muted-foreground hover:text-[#c4956a] transition-colors">
                    {i + 1}. {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Content */}
        <div
          className="prose prose-sm md:prose-base max-w-none
            prose-headings:font-light prose-headings:tracking-tight prose-headings:text-foreground prose-headings:scroll-mt-24
            prose-h2:text-lg prose-h2:md:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-h2:border-l-2 prose-h2:border-[#c4956a] prose-h2:pl-4
            prose-h3:text-base prose-h3:font-medium prose-h3:mt-6
            prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:text-sm prose-p:md:text-[15px]
            prose-strong:text-foreground
            prose-li:text-muted-foreground prose-li:text-sm
            prose-a:text-[#c4956a] prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Related products — surfaces the Blog model's relatedProducts field */}
        {relatedProducts.length > 0 && (
          <section className="mt-14 pt-10 border-t border-border">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-5">Featured in This Story</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {relatedProducts.map((p: any) => (
                <Link key={p.slug} href={`/product/${p.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-card border border-border">
                    <Image
                      src={p.images?.[0] || "/placeholder-product.svg"}
                      alt={p.name}
                      fill
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 33vw, 200px"
                    />
                  </div>
                  <p className="text-xs text-foreground mt-2 group-hover:text-[#c4956a] transition-colors line-clamp-1">{p.name}</p>
                  <p className="text-xs text-muted-foreground">₹{p.basePrice}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-14 pt-10 border-t border-border">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-5">More From the Journal</p>
            <div className="grid gap-4 md:gap-5">
              {relatedPosts.map((rp: any) => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group block p-4 border border-border hover:border-[#c4956a]/30 transition-colors">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-[#c4956a] transition-colors">{rp.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rp.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-12 md:mt-16 p-6 md:p-8 border border-[#c4956a]/20 bg-[#c4956a]/5 text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-2">Shop the Look</p>
          <p className="text-base md:text-lg font-light text-foreground">Explore our premium linen collection</p>
          <p className="text-xs text-muted-foreground mt-1">Handcrafted in Jodhpur. Free shipping above ₹1,599.</p>
          <Link
            href="/shirts"
            className="inline-flex items-center gap-2 mt-5 px-7 py-3 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-bold tracking-wider uppercase hover:opacity-90 transition-opacity"
          >
            Shop Now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    </>
  )
}
