import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"

const articles: Record<string, { title: string; description: string; content: string; date: string; category: string }> = {
  "best-formal-shirts-for-men": {
    title: "10 Best Formal Shirts for Men in 2026",
    description: "Discover the top formal shirts every man needs. From classic Oxford to slim-fit designs, find the perfect formal shirt for office, meetings & events.",
    date: "2026-05-15",
    category: "Style Guide",
    content: `
      <h2>Why Every Man Needs Quality Formal Shirts</h2>
      <p>A well-fitted formal shirt is the cornerstone of any professional wardrobe. Whether you're heading to the office, attending a business meeting, or dressing up for a formal event, the right shirt makes all the difference.</p>
      
      <h2>Top Formal Shirt Styles for 2026</h2>
      <h3>1. Classic Oxford Shirt</h3>
      <p>The Oxford shirt remains timeless. Its button-down collar and slightly textured fabric make it versatile enough for both formal and smart-casual settings. VCHUKI's Oxford shirts are crafted from premium long-staple cotton for exceptional comfort.</p>
      
      <h3>2. French Cuff Dress Shirt</h3>
      <p>For the most formal occasions, nothing beats a French cuff shirt paired with elegant cufflinks. Our formal white shirt with French cuffs is a bestseller for good reason.</p>
      
      <h3>3. Slim Fit Formal Shirt</h3>
      <p>Modern professionals prefer a slimmer silhouette. Our slim-fit formal shirts are tailored to follow the body's natural lines without being restrictive.</p>
      
      <h2>How to Choose the Right Formal Shirt</h2>
      <p>Consider these factors: fabric quality (100% cotton is ideal), collar style (spread collar for ties, button-down for casual), fit (slim, regular, or relaxed), and color (white and light blue are most versatile).</p>
      
      <h2>Care Tips for Formal Shirts</h2>
      <p>Always wash in cold water, hang dry when possible, and iron while slightly damp for the crispest finish. Store on wooden hangers to maintain collar shape.</p>
    `,
  },
  "linen-vs-cotton-shirts": {
    title: "Linen vs Cotton Shirts: Which is Better for Indian Summers?",
    description: "Detailed comparison of linen and cotton shirts for Indian weather. Learn about breathability, comfort, durability, and styling tips for both fabrics.",
    date: "2026-05-10",
    category: "Fabric Guide",
    content: `
      <h2>The Great Fabric Debate</h2>
      <p>When temperatures soar above 40°C in Indian summers, choosing the right shirt fabric becomes crucial. Both linen and cotton have their strengths, but which one is truly better for our climate?</p>
      
      <h2>Linen Shirts: The Summer Champion</h2>
      <p>Linen is made from flax fibers and is naturally the most breathable fabric available. It absorbs moisture quickly and dries fast, making it ideal for humid Indian summers.</p>
      <p><strong>Pros:</strong> Extremely breathable, gets softer with washes, natural texture looks premium, eco-friendly</p>
      <p><strong>Cons:</strong> Wrinkles easily, slightly rough initially, limited color options</p>
      
      <h2>Cotton Shirts: The All-Rounder</h2>
      <p>Cotton is versatile, comfortable, and available in countless weaves. From crisp poplin to soft Oxford, cotton adapts to every occasion.</p>
      <p><strong>Pros:</strong> Wrinkle-resistant options available, soft from day one, huge variety, easy to maintain</p>
      <p><strong>Cons:</strong> Less breathable than linen, can feel heavy in extreme heat</p>
      
      <h2>Our Recommendation</h2>
      <p>For peak summer (April-June): Choose linen. For monsoon and mild summers: Cotton works perfectly. For year-round versatility: A cotton-linen blend offers the best of both worlds.</p>
    `,
  },
  "summer-fashion-trends-2026": {
    title: "Summer Fashion Trends 2026: What's Hot This Season",
    description: "Stay ahead with the latest summer fashion trends for men in 2026. Discover trending colors, patterns, and shirt styles dominating this season.",
    date: "2026-05-05",
    category: "Trends",
    content: `
      <h2>2026 Summer Trends for Men</h2>
      <p>This summer is all about effortless sophistication. The key trends combine comfort with style, making it easier than ever to look put-together in the heat.</p>
      
      <h2>Trending Colors</h2>
      <p>Earth tones dominate this season — think sage green, terracotta, sand beige, and dusty blue. These natural hues pair beautifully with both light and dark bottoms.</p>
      
      <h2>Pattern Play</h2>
      <p>Micro-prints are replacing bold patterns. Subtle geometric prints, tone-on-tone textures, and minimalist stripes are the way to go in 2026.</p>
      
      <h2>Fabric Innovations</h2>
      <p>Performance fabrics that look premium are trending. Moisture-wicking cotton blends, wrinkle-free linen, and sustainable bamboo fabrics are gaining popularity.</p>
      
      <h2>Fit Evolution</h2>
      <p>The oversized trend is maturing into a "relaxed fit" — not baggy, but comfortably loose. Think structured shoulders with a slightly wider body for airflow.</p>
    `,
  },
  "how-to-style-premium-shirts": {
    title: "How to Style Premium Shirts for Every Occasion",
    description: "Learn how to style premium shirts for office, dates, casual outings & formal events. Expert styling tips from VCHUKI's fashion team.",
    date: "2026-04-28",
    category: "Style Tips",
    content: `
      <h2>The Art of Shirt Styling</h2>
      <p>A premium shirt is an investment piece that can be styled in multiple ways. Here's how to get maximum versatility from your VCHUKI shirts.</p>
      
      <h2>For the Office</h2>
      <p>Pair a crisp white or light blue formal shirt with tailored trousers and leather shoes. Keep the collar sharp and sleeves at the right length — showing about 1cm of cuff beyond your jacket sleeve.</p>
      
      <h2>For a Date Night</h2>
      <p>A mandarin collar shirt in navy or black creates a sophisticated yet relaxed look. Roll the sleeves once, pair with dark jeans and clean sneakers or loafers.</p>
      
      <h2>Weekend Casual</h2>
      <p>Wear your linen shirt unbuttoned over a quality t-shirt with chinos or shorts. This layered look is effortlessly cool and perfect for brunches or beach outings.</p>
      
      <h2>Formal Events</h2>
      <p>French cuff shirts with cufflinks, tucked into well-fitted suit trousers. Add a silk tie for weddings or keep it open-collar for cocktail parties.</p>
    `,
  },
  "top-casual-shirts-india": {
    title: "Top 8 Casual Shirts Every Indian Man Should Own",
    description: "Build the perfect casual wardrobe with these 8 essential shirt styles. From denim to Hawaiian prints, find shirts for every body type and occasion.",
    date: "2026-04-20",
    category: "Essentials",
    content: `
      <h2>Building Your Casual Shirt Collection</h2>
      <p>A well-curated casual shirt collection means you're always ready for any occasion — from weekend outings to impromptu dinner plans.</p>
      
      <h2>The Essential 8</h2>
      <h3>1. Classic Denim Shirt</h3>
      <p>The most versatile casual shirt. Works with chinos, joggers, or layered under a jacket.</p>
      
      <h3>2. White Linen Shirt</h3>
      <p>The ultimate summer essential. Looks great with everything from shorts to tailored trousers.</p>
      
      <h3>3. Flannel Check Shirt</h3>
      <p>Perfect for winters and layering. Choose a neutral check pattern for maximum versatility.</p>
      
      <h3>4. Polo T-Shirt</h3>
      <p>Smart casual perfection. A premium polo bridges the gap between t-shirts and shirts.</p>
      
      <h3>5. Hawaiian/Printed Shirt</h3>
      <p>For vacations and bold days. Choose subtle prints for everyday wear.</p>
      
      <h3>6. Mandarin Collar Shirt</h3>
      <p>A modern alternative to traditional collars. Great for Indian occasions and date nights.</p>
      
      <h3>7. Oxford Button-Down</h3>
      <p>The smart-casual workhorse. Dress it up or down effortlessly.</p>
      
      <h3>8. Oversized Relaxed Shirt</h3>
      <p>For the trend-conscious. Perfect for streetwear-inspired looks.</p>
    `,
  },
}

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = articles[params.slug]
  if (!article) return { title: "Not Found" }

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `https://vchuki.com/blog/${params.slug}` },
    openGraph: {
      title: article.title + " | VCHUKI Blog",
      description: article.description,
      url: `https://vchuki.com/blog/${params.slug}`,
      type: "article",
      publishedTime: article.date,
    },
  }
}

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }))
}

export default function BlogArticlePage({ params }: Props) {
  const article = articles[params.slug]
  if (!article) notFound()

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: { "@type": "Organization", name: "VCHUKI" },
    publisher: { "@type": "Organization", name: "VCHUKI", logo: { "@type": "ImageObject", url: "https://vchuki.com/logo.svg" } },
    mainEntityOfPage: `https://vchuki.com/blog/${params.slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="container py-4 md:py-8 max-w-3xl">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground truncate">{article.title}</span>
        </nav>

        <div className="mb-6">
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{article.category}</span>
          <h1 className="text-xl md:text-3xl font-bold mt-3">{article.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{article.date} · VCHUKI Fashion Team</p>
        </div>

        <div
          className="prose prose-sm md:prose-base max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-h2:text-lg prose-h2:font-bold prose-h2:mt-8 prose-h3:text-base prose-h3:font-semibold"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-12 p-6 rounded-xl border bg-card text-center">
          <p className="font-bold">Shop the looks mentioned in this article</p>
          <p className="text-sm text-muted-foreground mt-1">Explore our premium shirt collection</p>
          <Link href="/shirts" className="inline-block mt-3 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Shop Now
          </Link>
        </div>
      </article>
    </>
  )
}
