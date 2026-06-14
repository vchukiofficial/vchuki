import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://Vercel-Admin-vchuki:0k6m4v1HkF0MEyCk@vchuki.8n7yfy8.mongodb.net/vchuki?retryWrites=true&w=majority';

const ProductSchema = new mongoose.Schema({
  name: String, slug: String, description: String, basePrice: Number,
  comparePrice: Number, // MRP for strikethrough pricing
  category: String, tags: [String], images: [String],
  isFeatured: { type: Boolean, default: false }, isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 }, reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

const ProductVariantSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  color: { name: String, hex: String }, size: String, fabric: String,
  fit: { type: String, enum: ['slim', 'regular', 'relaxed'] },
  stock: { type: Number, default: 0 }, priceAdjustment: { type: Number, default: 0 },
  sku: String, images: [String],
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: [{ name: String, street: String, city: String, state: String, zip: String, phone: String }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ product: mongoose.Schema.Types.ObjectId, variant: mongoose.Schema.Types.ObjectId, name: String, price: Number, quantity: Number, size: String, color: String }],
  totalAmount: Number, discountAmount: { type: Number, default: 0 }, finalAmount: Number,
  couponCode: String, couponDiscount: Number,
  shippingAddress: { name: String, street: String, city: String, state: String, zip: String, phone: String },
  paymentMethod: { type: String, default: 'cod' }, paymentStatus: { type: String, default: 'paid' },
  paymentId: String, shippingStatus: { type: String, default: 'delivered' },
  courier: String, awb: String,
  timeline: [{ event: String, timestamp: { type: Date, default: Date.now } }],
}, { timestamps: true });

const CouponSchema = new mongoose.Schema({
  code: String, type: String, value: Number, maxValue: Number, minAmount: Number,
  validFrom: Date, validTo: Date, usageLimit: Number, usedBy: [String],
  categories: [String], isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number, comment: String, images: [String],
  verifiedPurchase: { type: Boolean, default: true },
  status: { type: String, default: 'approved' },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const ProductVariant = mongoose.models.ProductVariant || mongoose.model('ProductVariant', ProductVariantSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

// ============================================
// 5 COLORS — same across all product types
// ============================================
const COLORS = [
  { name: 'Ivory White', hex: '#F5F3EE' },
  { name: 'Desert Sand', hex: '#D4A574' },
  { name: 'Golden Dune', hex: '#C4956A' },
  { name: 'Olive Green', hex: '#6B7C5E' },
  { name: 'Royal Indigo', hex: '#3D5A80' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// ============================================
// PRODUCTS — 4 categories × 5 products each = 20 products
// Each product = 1 color (so 5 products = 5 colors per category)
// ============================================

// --- LINEN FULL SLEEVE SHIRTS (5 colors) ---
const LINEN_FULL_SLEEVE = [
  {
    name: 'Ivory White Linen Full Sleeve Shirt',
    slug: 'ivory-white-linen-full-sleeve-shirt',
    description: 'Pure elegance in its simplest form. This ivory white premium linen full sleeve shirt is the foundation of quiet luxury — versatile, timeless, and impossibly soft against the skin. Crafted in Jodhpur with 100% natural linen.',
    basePrice: 799, comparePrice: 1299,
    color: COLORS[0],
    image: '/fullsleevwhiteshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Desert Sand Linen Full Sleeve Shirt',
    slug: 'desert-sand-linen-full-sleeve-shirt',
    description: 'Inspired by the golden dunes of Thar. This premium linen full sleeve shirt carries the warmth of Rajasthan\'s desert sunsets. Breathable, soft, and crafted for the man who values understated luxury.',
    basePrice: 799, comparePrice: 1299,
    color: COLORS[1],
    image: '/fullsleevedesertsanshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Golden Dune Linen Full Sleeve Shirt',
    slug: 'golden-dune-linen-full-sleeve-shirt',
    description: 'The warm amber glow of a Rajasthani sunset captured in premium linen. This full sleeve shirt embodies heritage craftsmanship with modern sophistication. Effortlessly elegant for every occasion.',
    basePrice: 799, comparePrice: 1299,
    color: COLORS[2],
    image: '/fullsleevgoldevduneshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Olive Green Linen Full Sleeve Shirt',
    slug: 'olive-green-linen-full-sleeve-shirt',
    description: 'Botanical calm meets premium fabric. This olive green linen full sleeve shirt brings the serenity of nature to your wardrobe. Lightweight, breathable, effortlessly elegant for the modern man.',
    basePrice: 799, comparePrice: 1299,
    color: COLORS[3],
    image: '/fullsleevolivegreenshortshirts.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Royal Indigo Linen Full Sleeve Shirt',
    slug: 'royal-indigo-linen-full-sleeve-shirt',
    description: 'The deep indigo of a moonlit Jodhpur haveli. Premium European linen with a modern fit. Each thread tells a story of royal Rajasthani craftsmanship reimagined for today.',
    basePrice: 899, comparePrice: 1499,
    color: COLORS[4],
    image: '/fullsleevroyalindigoshortkurta.png', // REPLACE with blob URL after upload
  },
];

// --- LINEN HALF SLEEVE SHIRTS (5 colors) ---
const LINEN_HALF_SLEEVE = [
  {
    name: 'Ivory White Linen Half Sleeve Shirt',
    slug: 'ivory-white-linen-half-sleeve-shirt',
    description: 'Embrace the summer with this pristine ivory white linen half sleeve shirt. Perfect for warm days — lightweight, breathable, and designed for effortless style. Premium linen crafted in Jodhpur.',
    basePrice: 699, comparePrice: 1099,
    color: COLORS[0],
    image: '/shortsleevwhiteshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Desert Sand Linen Half Sleeve Shirt',
    slug: 'desert-sand-linen-half-sleeve-shirt',
    description: 'The warmth of Thar desert in a breezy half sleeve cut. This premium linen shirt is your go-to for relaxed weekends and summer evenings. Soft, breathable, unmistakably premium.',
    basePrice: 699, comparePrice: 1099,
    color: COLORS[1],
    image: '/shortsleevdesertsandshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Golden Dune Linen Half Sleeve Shirt',
    slug: 'golden-dune-linen-half-sleeve-shirt',
    description: 'Sun-kissed golden tones in a relaxed half sleeve silhouette. This premium linen shirt captures the spirit of Rajasthan\'s landscapes. Perfect for the man who values comfort with character.',
    basePrice: 699, comparePrice: 1099,
    color: COLORS[2],
    image: '/shortsleevgoldenduneshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Olive Green Linen Half Sleeve Shirt',
    slug: 'olive-green-linen-half-sleeve-shirt',
    description: 'Natural earthy tones in a contemporary half sleeve cut. This olive green linen shirt brings understated sophistication to your casual wardrobe. Breathable comfort meets premium style.',
    basePrice: 699, comparePrice: 1099,
    color: COLORS[3],
    image: '/shortsleevolivegreenshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Royal Indigo Linen Half Sleeve Shirt',
    slug: 'royal-indigo-linen-half-sleeve-shirt',
    description: 'Deep ocean blues in a relaxed half sleeve form. This premium linen shirt combines royal heritage with summer ease. A statement piece that speaks volumes in its simplicity.',
    basePrice: 749, comparePrice: 1199,
    color: COLORS[4],
    image: '/shortsleeroyalindigoshortkurta.png', // REPLACE with blob URL after upload
  },
];

// --- SHORT KURTA FULL SLEEVE (5 colors) ---
const KURTA_FULL_SLEEVE = [
  {
    name: 'Ivory White Short Kurta Full Sleeve',
    slug: 'ivory-white-short-kurta-full-sleeve',
    description: 'Modern ethnic reimagined. This ivory white premium linen short kurta with full sleeves brings Rajasthani heritage to contemporary fashion. Perfect for festivals, gatherings, and making an impression.',
    basePrice: 899, comparePrice: 1499,
    color: COLORS[0],
    image: '/fullsleevwhiteshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Desert Sand Short Kurta Full Sleeve',
    slug: 'desert-sand-short-kurta-full-sleeve',
    description: 'The golden warmth of Rajasthan in a modern kurta silhouette. Premium linen, full sleeves, and a relaxed cut that flows with every movement. Ethnic style, modern confidence.',
    basePrice: 899, comparePrice: 1499,
    color: COLORS[1],
    image: '/fullsleevedesertsanshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Golden Dune Short Kurta Full Sleeve',
    slug: 'golden-dune-short-kurta-full-sleeve',
    description: 'Heritage meets contemporary in this golden dune premium linen kurta. Full sleeves, mandarin collar, and a silhouette that bridges tradition with modern masculine style.',
    basePrice: 899, comparePrice: 1499,
    color: COLORS[2],
    image: '/fullsleevgoldevduneshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Olive Green Short Kurta Full Sleeve',
    slug: 'olive-green-short-kurta-full-sleeve',
    description: 'Earthy sophistication in a modern kurta form. This olive green premium linen full sleeve kurta is designed for the man who wears tradition with pride and modernity with ease.',
    basePrice: 899, comparePrice: 1499,
    color: COLORS[3],
    image: '/fullsleevolivegreenshortshirts.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Royal Indigo Short Kurta Full Sleeve',
    slug: 'royal-indigo-short-kurta-full-sleeve',
    description: 'The regal depth of indigo in a premium linen kurta. Full sleeves, artisan detailing, and the unmistakable aura of Jodhpur royalty. For occasions that demand presence.',
    basePrice: 999, comparePrice: 1599,
    color: COLORS[4],
    image: '/fullsleevroyalindigoshortkurta.png', // REPLACE with blob URL after upload
  },
];

// --- SHORT KURTA HALF SLEEVE (5 colors) ---
const KURTA_HALF_SLEEVE = [
  {
    name: 'Ivory White Short Kurta Half Sleeve',
    slug: 'ivory-white-short-kurta-half-sleeve',
    description: 'Effortless ethnic style for warm days. This ivory white premium linen half sleeve kurta is the perfect fusion of comfort and tradition. Clean, minimal, and unmistakably premium.',
    basePrice: 799, comparePrice: 1299,
    color: COLORS[0],
    image: '/shortsleevwhiteshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Desert Sand Short Kurta Half Sleeve',
    slug: 'desert-sand-short-kurta-half-sleeve',
    description: 'Casual ethnic elevated. This desert sand premium linen half sleeve kurta captures the spirit of relaxed Rajasthani style. Breathable, comfortable, and effortlessly handsome.',
    basePrice: 799, comparePrice: 1299,
    color: COLORS[1],
    image: '/shortsleevdesertsandshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Golden Dune Short Kurta Half Sleeve',
    slug: 'golden-dune-short-kurta-half-sleeve',
    description: 'Sun-warmed gold in a breezy half sleeve kurta. Premium linen, mandarin collar, and a relaxed fit that moves with you. Perfect for summer gatherings and casual ethnic occasions.',
    basePrice: 799, comparePrice: 1299,
    color: COLORS[2],
    image: '/shortsleevgoldenduneshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Olive Green Short Kurta Half Sleeve',
    slug: 'olive-green-short-kurta-half-sleeve',
    description: 'Natural tones meet ethnic heritage. This olive green linen half sleeve kurta brings a modern edge to traditional silhouettes. Ideal for the man who blends worlds effortlessly.',
    basePrice: 799, comparePrice: 1299,
    color: COLORS[3],
    image: '/shortsleevolivegreenshortkurta.png', // REPLACE with blob URL after upload
  },
  {
    name: 'Royal Indigo Short Kurta Half Sleeve',
    slug: 'royal-indigo-short-kurta-half-sleeve',
    description: 'Deep indigo in a relaxed half sleeve kurta. This premium linen piece brings the majesty of Jodhpur to your everyday ethnic wardrobe. Cool, composed, and commanding.',
    basePrice: 849, comparePrice: 1399,
    color: COLORS[4],
    image: '/shortsleeroyalindigoshortkurta.png', // REPLACE with blob URL after upload
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB\n');

  // Clear all data
  await Promise.all([
    Product.deleteMany({}), ProductVariant.deleteMany({}),
    User.deleteMany({}), Order.deleteMany({}),
    Coupon.deleteMany({}), Review.deleteMany({}),
  ]);
  console.log('✓ Cleared existing data\n');

  // --- USERS ---
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = await User.insertMany([
    { name: 'Admin', email: 'admin@vchuki.com', password: hashedPassword, role: 'admin', addresses: [{ name: 'VCHUKI HQ', street: '45 Textile Market, Paota', city: 'Jodhpur', state: 'Rajasthan', zip: '342001', phone: '9876543210' }] },
    { name: 'Rahul Sharma', email: 'rahul@example.com', password: hashedPassword, role: 'user', addresses: [{ name: 'Home', street: '45 Nehru Nagar', city: 'Delhi', state: 'Delhi', zip: '110001', phone: '9876543211' }] },
    { name: 'Vikram Mehta', email: 'vikram@example.com', password: hashedPassword, role: 'user', addresses: [{ name: 'Home', street: '78 Bandra West', city: 'Mumbai', state: 'Maharashtra', zip: '400050', phone: '9876543212' }] },
    { name: 'Arjun Kapoor', email: 'arjun@example.com', password: hashedPassword, role: 'user', addresses: [{ name: 'Home', street: '12 Koramangala', city: 'Bangalore', state: 'Karnataka', zip: '560034', phone: '9876543213' }] },
    { name: 'Karan Singh', email: 'karan@example.com', password: hashedPassword, role: 'user', addresses: [{ name: 'Home', street: '56 Civil Lines', city: 'Jaipur', state: 'Rajasthan', zip: '302001', phone: '9876543214' }] },
  ]);
  console.log(`✓ Created ${users.length} users\n`);

  // --- CREATE PRODUCTS ---
  console.log('━━━ Creating Products ━━━\n');

  async function createCategoryProducts(items: any[], categoryTag: string, sleeveTag: string, productType: string) {
    const products: any[] = [];
    const extraTags = ['summer', 'luxury', 'featured'];
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const tags = ['linen', sleeveTag, 'new-launch', 'premium'];
      if (productType === 'kurta') tags.push('kurta');
      if (item.basePrice >= 899) tags.push('bestseller');
      // Distribute extra tags across products so all filters have results
      tags.push(extraTags[idx % extraTags.length]);
      if (idx < 2) tags.push('summer');
      if (idx >= 3) tags.push('luxury');
      if (idx === 0 || idx === 2) tags.push('featured');

      const product = await Product.create({
        name: item.name,
        slug: item.slug,
        description: item.description,
        basePrice: item.basePrice,
        comparePrice: item.comparePrice,
        category: categoryTag,
        tags,
        images: [item.image],
        isFeatured: true,
        isActive: true,
        rating: (4 + Math.random()).toFixed(1),
        reviewCount: Math.floor(Math.random() * 100) + 20,
      });

      // Create variants — all 5 sizes for this color
      for (const size of SIZES) {
        const priceAdj = size === 'XXL' ? 100 : size === 'XL' ? 50 : 0;
        const stock = size === 'M' || size === 'L' ? 80 : size === 'XL' ? 60 : size === 'S' ? 50 : 30;

        await ProductVariant.create({
          product: product._id,
          color: { name: item.color.name, hex: item.color.hex },
          size,
          fabric: '100% Premium Linen',
          fit: 'regular',
          stock,
          priceAdjustment: priceAdj,
          sku: `VC-${item.slug}-${size}`,
          images: [item.image],
        });
      }

      products.push(product);
      console.log(`  ✓ ${item.name} (${item.color.name}) — ₹${item.basePrice} / MRP ₹${item.comparePrice}`);
    }
    return products;
  }

  console.log('📦 Linen Full Sleeve Shirts:');
  const linenFullProducts = await createCategoryProducts(LINEN_FULL_SLEEVE, 'linen-full-sleeve', 'full-sleeve', 'shirt');

  console.log('\n📦 Linen Half Sleeve Shirts:');
  const linenHalfProducts = await createCategoryProducts(LINEN_HALF_SLEEVE, 'linen-half-sleeve', 'half-sleeve', 'shirt');

  console.log('\n📦 Short Kurta Full Sleeve:');
  const kurtaFullProducts = await createCategoryProducts(KURTA_FULL_SLEEVE, 'kurta-full-sleeve', 'full-sleeve', 'kurta');

  console.log('\n📦 Short Kurta Half Sleeve:');
  const kurtaHalfProducts = await createCategoryProducts(KURTA_HALF_SLEEVE, 'kurta-half-sleeve', 'half-sleeve', 'kurta');

  const allProducts = [...linenFullProducts, ...linenHalfProducts, ...kurtaFullProducts, ...kurtaHalfProducts];
  console.log(`\n✓ Total: ${allProducts.length} products created`);
  console.log(`✓ Total: ${allProducts.length * SIZES.length} variants created\n`);

  // --- COUPONS ---
  const now = new Date();
  const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  await Coupon.insertMany([
    { code: 'WELCOME10', type: 'percentage', value: 10, maxValue: 200, minAmount: 500, validFrom: now, validTo: futureDate, usageLimit: 5000, isActive: true },
    { code: 'LINEN15', type: 'percentage', value: 15, maxValue: 300, minAmount: 799, validFrom: now, validTo: futureDate, usageLimit: 1000, categories: ['linen-full-sleeve', 'linen-half-sleeve'], isActive: true },
    { code: 'KURTA20', type: 'percentage', value: 20, maxValue: 400, minAmount: 899, validFrom: now, validTo: futureDate, usageLimit: 1000, categories: ['kurta-full-sleeve', 'kurta-half-sleeve'], isActive: true },
    { code: 'FLAT100', type: 'flat', value: 100, minAmount: 999, validFrom: now, validTo: futureDate, usageLimit: 2000, isActive: true },
    { code: 'FREESHIP', type: 'free_shipping', value: 0, minAmount: 799, validFrom: now, validTo: futureDate, usageLimit: 5000, isActive: true },
    { code: 'FIRST50', type: 'first_order', value: 50, maxValue: 500, minAmount: 799, validFrom: now, validTo: futureDate, usageLimit: 10000, isActive: true },
  ]);
  console.log('✓ Created 6 coupons\n');

  // --- ORDERS ---
  const orderData = [
    { user: users[1]._id, items: [{ product: linenFullProducts[1]._id, name: 'Desert Sand Linen Full Sleeve Shirt', price: 799, quantity: 2, size: 'M', color: 'Desert Sand' }], totalAmount: 1598, discountAmount: 100, finalAmount: 1498, couponCode: 'FLAT100', shippingStatus: 'delivered', paymentStatus: 'paid', paymentMethod: 'razorpay', paymentId: 'pay_vchuki_001' },
    { user: users[2]._id, items: [{ product: linenFullProducts[4]._id, name: 'Royal Indigo Linen Full Sleeve Shirt', price: 899, quantity: 1, size: 'L', color: 'Royal Indigo' }, { product: kurtaFullProducts[0]._id, name: 'Ivory White Short Kurta Full Sleeve', price: 899, quantity: 1, size: 'M', color: 'Ivory White' }], totalAmount: 1798, discountAmount: 179, finalAmount: 1619, couponCode: 'WELCOME10', shippingStatus: 'shipped', paymentStatus: 'paid', paymentMethod: 'cod', courier: 'Delhivery', awb: 'DL7892345' },
    { user: users[3]._id, items: [{ product: kurtaFullProducts[2]._id, name: 'Golden Dune Short Kurta Full Sleeve', price: 899, quantity: 3, size: 'L', color: 'Golden Dune' }], totalAmount: 2697, discountAmount: 400, finalAmount: 2297, couponCode: 'KURTA20', shippingStatus: 'delivered', paymentStatus: 'paid', paymentMethod: 'razorpay', paymentId: 'pay_vchuki_003' },
    { user: users[4]._id, items: [{ product: linenHalfProducts[3]._id, name: 'Olive Green Linen Half Sleeve Shirt', price: 699, quantity: 2, size: 'XL', color: 'Olive Green' }], totalAmount: 1398, discountAmount: 0, finalAmount: 1398, shippingStatus: 'pending', paymentStatus: 'paid', paymentMethod: 'cod' },
    { user: users[1]._id, items: [{ product: kurtaHalfProducts[4]._id, name: 'Royal Indigo Short Kurta Half Sleeve', price: 849, quantity: 1, size: 'M', color: 'Royal Indigo' }], totalAmount: 849, discountAmount: 0, finalAmount: 849, shippingStatus: 'packaging', paymentStatus: 'paid', paymentMethod: 'razorpay', paymentId: 'pay_vchuki_005' },
  ];

  for (const order of orderData) {
    await Order.create({
      ...order,
      shippingAddress: users.find(u => u._id.equals(order.user))?.addresses?.[0] || { name: 'Customer', street: '123 Street', city: 'Jodhpur', state: 'Rajasthan', zip: '342001', phone: '9999999999' },
      timeline: [
        { event: 'Order placed', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { event: 'Payment confirmed', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60000) },
        ...(order.shippingStatus !== 'pending' ? [{ event: 'Packaging started', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }] : []),
        ...(order.shippingStatus === 'shipped' || order.shippingStatus === 'delivered' ? [{ event: 'Shipped', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) }] : []),
        ...(order.shippingStatus === 'delivered' ? [{ event: 'Delivered', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }] : []),
      ],
    });
  }
  console.log(`✓ Created ${orderData.length} orders\n`);

  // --- REVIEWS (spread across all categories) ---
  await Review.insertMany([
    // Linen Full Sleeve
    { product: linenFullProducts[1]._id, user: users[1]._id, rating: 5, comment: 'The Desert Sand color is absolutely stunning. Fabric feels incredible — better than brands 3x the price. True Rajasthani craftsmanship.', verifiedPurchase: true, featured: true, status: 'approved' },
    { product: linenFullProducts[4]._id, user: users[2]._id, rating: 5, comment: 'Royal Indigo is a showstopper. Gets compliments every single time. Perfect fit, premium feel. VCHUKI has replaced all my other brands.', verifiedPurchase: true, featured: true, status: 'approved' },
    { product: linenFullProducts[0]._id, user: users[3]._id, rating: 5, comment: 'The Ivory White is pure class. Goes with everything. Fabric hasn\'t faded after 15 washes. Will buy more colors.', verifiedPurchase: true, status: 'approved' },
    { product: linenFullProducts[2]._id, user: users[4]._id, rating: 4, comment: 'Beautiful golden shade. The linen quality is unmatched at this price point. Slightly loose on arms but overall excellent.', verifiedPurchase: true, status: 'approved' },
    // Linen Half Sleeve
    { product: linenHalfProducts[0]._id, user: users[2]._id, rating: 5, comment: 'Perfect for Mumbai summers! The half sleeve cut is so comfortable. Ivory looks clean and premium.', verifiedPurchase: true, featured: true, status: 'approved' },
    { product: linenHalfProducts[3]._id, user: users[4]._id, rating: 5, comment: 'Olive Green half sleeve is my new favorite. So breathable in Jaipur heat. Love the relaxed fit.', verifiedPurchase: true, status: 'approved' },
    { product: linenHalfProducts[1]._id, user: users[1]._id, rating: 4, comment: 'Great casual shirt for weekends. Desert Sand color is very versatile. Good value for the quality.', verifiedPurchase: true, status: 'approved' },
    // Kurta Full Sleeve
    { product: kurtaFullProducts[2]._id, user: users[3]._id, rating: 5, comment: 'Wore this for Diwali — everyone asked where I got it. Golden Dune kurta is absolutely premium. The linen drapes beautifully.', verifiedPurchase: true, featured: true, status: 'approved' },
    { product: kurtaFullProducts[4]._id, user: users[1]._id, rating: 5, comment: 'Royal Indigo kurta is the most beautiful piece I own. The mandarin collar and full sleeves look regal. Worth every rupee.', verifiedPurchase: true, status: 'approved' },
    { product: kurtaFullProducts[0]._id, user: users[2]._id, rating: 4, comment: 'Clean, minimal, premium. The ivory kurta works for office and festivals both. Fabric softens beautifully with washes.', verifiedPurchase: true, status: 'approved' },
    // Kurta Half Sleeve
    { product: kurtaHalfProducts[4]._id, user: users[4]._id, rating: 5, comment: 'Bought this as a gift. The packaging alone felt luxury. The kurta exceeded all expectations. Indigo is gorgeous.', verifiedPurchase: true, featured: true, status: 'approved' },
    { product: kurtaHalfProducts[1]._id, user: users[3]._id, rating: 5, comment: 'Desert Sand half sleeve kurta is so comfortable for daily wear. Looks ethnic but feels modern. Great brand!', verifiedPurchase: true, status: 'approved' },
  ]);
  console.log('✓ Created 12 reviews (across all categories)\n');

  // Update wishlists
  await User.findByIdAndUpdate(users[1]._id, { wishlist: [kurtaFullProducts[2]._id, linenHalfProducts[0]._id] });
  await User.findByIdAndUpdate(users[2]._id, { wishlist: [linenFullProducts[1]._id, kurtaHalfProducts[4]._id, linenFullProducts[4]._id] });

  // --- SUMMARY ---
  console.log('\n' + '═'.repeat(55));
  console.log('  ✅ VCHUKI SEED COMPLETE — All Categories Populated');
  console.log('═'.repeat(55));
  console.log('\n📦 PRODUCT CATALOG:\n');
  console.log('  ┌─────────────────────────────┬───────┬──────────┬──────────┐');
  console.log('  │ Category                    │ Count │ Price    │ MRP      │');
  console.log('  ├─────────────────────────────┼───────┼──────────┼──────────┤');
  console.log('  │ Linen Full Sleeve Shirt     │   5   │ ₹799-899 │ ₹1299-1499│');
  console.log('  │ Linen Half Sleeve Shirt     │   5   │ ₹699-749 │ ₹1099-1199│');
  console.log('  │ Short Kurta Full Sleeve     │   5   │ ₹899-999 │ ₹1499-1599│');
  console.log('  │ Short Kurta Half Sleeve     │   5   │ ₹799-849 │ ₹1299-1399│');
  console.log('  ├─────────────────────────────┼───────┼──────────┼──────────┤');
  console.log('  │ TOTAL                       │  20   │          │          │');
  console.log('  └─────────────────────────────┴───────┴──────────┴──────────┘');
  console.log('\n🎨 COLORS (5 per category):');
  console.log('  • Ivory White • Desert Sand • Golden Dune • Olive Green • Royal Indigo');
  console.log('\n📏 SIZES: S, M, L, XL, XXL (100 variants per category = 100 total SKUs)');
  console.log(`\n🔢 TOTAL VARIANTS: ${allProducts.length * SIZES.length}`);
  console.log('\n📋 Login credentials:');
  console.log('  Admin: admin@vchuki.com / password123');
  console.log('  User:  rahul@example.com / password123');
  console.log('  User:  vikram@example.com / password123');
  console.log('  User:  arjun@example.com / password123');
  console.log('  User:  karan@example.com / password123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
