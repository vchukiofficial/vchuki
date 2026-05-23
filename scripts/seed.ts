import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://Vercel-Admin-vchuki:0k6m4v1HkF0MEyCk@vchuki.8n7yfy8.mongodb.net/vchuki?retryWrites=true&w=majority';

const ProductSchema = new mongoose.Schema({
  name: String, slug: String, description: String, basePrice: Number,
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
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const ProductVariant = mongoose.models.ProductVariant || mongoose.model('ProductVariant', ProductVariantSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    Product.deleteMany({}), ProductVariant.deleteMany({}),
    User.deleteMany({}), Order.deleteMany({}),
    Coupon.deleteMany({}), Review.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // --- USERS ---
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = await User.insertMany([
    { name: 'Admin', email: 'admin@vchuki.com', password: hashedPassword, role: 'admin', addresses: [{ name: 'VCHUKI HQ', street: '45 Textile Market, Paota', city: 'Jodhpur', state: 'Rajasthan', zip: '342001', phone: '9876543210' }] },
    { name: 'Rahul Sharma', email: 'rahul@example.com', password: hashedPassword, role: 'user', addresses: [{ name: 'Home', street: '45 Nehru Nagar', city: 'Delhi', state: 'Delhi', zip: '110001', phone: '9876543211' }] },
    { name: 'Vikram Mehta', email: 'vikram@example.com', password: hashedPassword, role: 'user', addresses: [{ name: 'Home', street: '78 Bandra West', city: 'Mumbai', state: 'Maharashtra', zip: '400050', phone: '9876543212' }] },
    { name: 'Arjun Kapoor', email: 'arjun@example.com', password: hashedPassword, role: 'user', addresses: [{ name: 'Home', street: '12 Koramangala', city: 'Bangalore', state: 'Karnataka', zip: '560034', phone: '9876543213' }] },
    { name: 'Karan Singh', email: 'karan@example.com', password: hashedPassword, role: 'user', addresses: [{ name: 'Home', street: '56 Civil Lines', city: 'Jaipur', state: 'Rajasthan', zip: '302001', phone: '9876543214' }] },
  ]);
  console.log(`Created ${users.length} users`);

  // --- PRODUCTS (Premium Linen Menswear) ---
  const products = await Product.insertMany([
    // LINEN COLLECTION - Core
    {
      name: 'Desert Sand Linen Shirt', slug: 'desert-sand-linen-shirt',
      description: 'Inspired by the golden dunes of Thar. This premium linen shirt carries the warmth of Rajasthan\'s desert sunsets. Breathable, soft, and crafted for the man who values understated luxury.',
      basePrice: 799, category: 'linen', tags: ['linen', 'bestseller', 'new-launch', 'summer'],
      images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'], isFeatured: true,
    },
    {
      name: 'Royal Indigo Linen Shirt', slug: 'royal-indigo-linen-shirt',
      description: 'The deep indigo of a moonlit Jodhpur haveli. Premium European linen with a modern slim fit. Each thread tells a story of royal Rajasthani craftsmanship.',
      basePrice: 899, category: 'linen', tags: ['linen', 'bestseller', 'new-launch', 'premium'],
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'], isFeatured: true,
    },
    {
      name: 'Sage Linen Shirt', slug: 'sage-linen-shirt',
      description: 'Botanical calm meets premium fabric. This sage green linen shirt brings the serenity of Rajasthan\'s gardens to your wardrobe. Lightweight, breathable, effortlessly elegant.',
      basePrice: 799, category: 'linen', tags: ['linen', 'new-launch', 'summer', 'bestseller'],
      images: ['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600'], isFeatured: true,
    },
    {
      name: 'Rust Earth Linen Shirt', slug: 'rust-earth-linen-shirt',
      description: 'The warm copper tones of handcrafted Rajasthani pottery. Premium linen with artisan-inspired color that deepens beautifully with each wear.',
      basePrice: 849, category: 'linen', tags: ['linen', 'new-launch', 'artisan'],
      images: ['https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600'], isFeatured: true,
    },
    {
      name: 'Ivory Cream Linen Shirt', slug: 'ivory-cream-linen-shirt',
      description: 'Pure elegance in its simplest form. This ivory linen shirt is the foundation of quiet luxury — versatile, timeless, and impossibly soft against the skin.',
      basePrice: 799, category: 'linen', tags: ['linen', 'bestseller', 'classic', 'new-launch'],
      images: ['https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600'], isFeatured: true,
    },
    // FORMAL COLLECTION
    {
      name: 'Midnight Black Formal Shirt', slug: 'midnight-black-formal-shirt',
      description: 'Commanding presence in premium cotton-linen blend. Tailored for the modern professional who demands both comfort and sophistication.',
      basePrice: 999, category: 'formal', tags: ['formal', 'premium', 'bestseller', 'new-launch'],
      images: ['https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600'], isFeatured: true,
    },
    {
      name: 'Pearl White Formal Shirt', slug: 'pearl-white-formal-shirt',
      description: 'The essential white shirt, elevated. Premium Egyptian cotton with a subtle sheen. French cuffs and mother-of-pearl buttons for the discerning gentleman.',
      basePrice: 1099, category: 'formal', tags: ['formal', 'premium', 'classic'],
      images: ['https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600'], isFeatured: true,
    },
    // CASUAL COLLECTION
    {
      name: 'Ocean Blue Casual Shirt', slug: 'ocean-blue-casual-shirt',
      description: 'The freedom of open skies in premium cotton. Relaxed fit, rolled-up sleeves, weekend-ready. Dyed with natural indigo for a color that lives and breathes.',
      basePrice: 699, category: 'casual', tags: ['casual', 'cotton', 'new-launch', 'weekend'],
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'], isFeatured: true,
    },
    {
      name: 'Olive Grove Casual Shirt', slug: 'olive-grove-casual-shirt',
      description: 'Earthy sophistication for the modern explorer. Premium cotton with a garment-washed finish that gets better with every wear.',
      basePrice: 749, category: 'casual', tags: ['casual', 'cotton', 'bestseller'],
      images: ['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600'], isFeatured: true,
    },
    // PREMIUM COLLECTION
    {
      name: 'Heritage Gold Linen Shirt', slug: 'heritage-gold-linen-shirt',
      description: 'The crown jewel of our collection. Hand-finished premium linen in a muted gold that captures the grandeur of Rajasthan\'s palaces. Limited edition craftsmanship.',
      basePrice: 1299, category: 'premium', tags: ['premium', 'linen', 'limited-edition', 'new-launch'],
      images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'], isFeatured: true,
    },
    {
      name: 'Charcoal Linen Blend Shirt', slug: 'charcoal-linen-blend-shirt',
      description: 'Sophisticated charcoal in a luxurious linen-cotton blend. The perfect balance of structure and breathability for day-to-night versatility.',
      basePrice: 949, category: 'linen', tags: ['linen', 'premium', 'versatile', 'new-launch'],
      images: ['https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600'], isFeatured: true,
    },
    {
      name: 'Dusty Rose Linen Shirt', slug: 'dusty-rose-linen-shirt',
      description: 'Bold yet refined. This dusty rose linen shirt breaks conventions with quiet confidence. For the man who leads, not follows.',
      basePrice: 849, category: 'linen', tags: ['linen', 'new-launch', 'bold'],
      images: ['https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600'], isFeatured: false,
    },
  ]);
  console.log(`Created ${products.length} products`);

  // --- VARIANTS (Heritage Colors) ---
  const variantColors = [
    { name: 'Desert Sand', hex: '#D4A574' },
    { name: 'Royal Indigo', hex: '#3D5A80' },
    { name: 'Sage', hex: '#6B7C5E' },
    { name: 'Rust Earth', hex: '#8B4513' },
    { name: 'Ivory Cream', hex: '#F5E6D3' },
    { name: 'Midnight Black', hex: '#1A1A1A' },
    { name: 'Charcoal', hex: '#36454F' },
    { name: 'Ocean Blue', hex: '#4A90D9' },
    { name: 'Olive', hex: '#556B2F' },
    { name: 'Heritage Gold', hex: '#C4956A' },
  ];

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const variants: any[] = [];

  for (const product of products) {
    // Assign 3-4 colors per product based on category
    let productColors: typeof variantColors;
    if (product.category === 'linen') {
      productColors = variantColors.slice(0, 5); // Sand, Indigo, Sage, Rust, Ivory
    } else if (product.category === 'formal') {
      productColors = [variantColors[5], variantColors[4], variantColors[6]]; // Black, Ivory, Charcoal
    } else if (product.category === 'premium') {
      productColors = [variantColors[9], variantColors[0], variantColors[6]]; // Gold, Sand, Charcoal
    } else {
      productColors = [variantColors[7], variantColors[8], variantColors[0]]; // Ocean, Olive, Sand
    }

    for (const color of productColors) {
      for (const size of sizes) {
        variants.push({
          product: product._id,
          color, size,
          fabric: product.category === 'linen' || product.category === 'premium' ? '100% Premium Linen' : 'Premium Cotton',
          fit: product.tags.includes('slim') ? 'slim' : 'regular',
          stock: Math.floor(Math.random() * 40) + 10,
          priceAdjustment: size === 'XXL' ? 50 : 0,
          sku: `VC-${product.slug}-${color.name.toLowerCase().replace(/\s/g, '-')}-${size}`,
          images: product.images,
        });
      }
    }
  }
  await ProductVariant.insertMany(variants);
  console.log(`Created ${variants.length} variants`);

  // --- COUPONS ---
  const now = new Date();
  const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  await Coupon.insertMany([
    { code: 'WELCOME10', type: 'percentage', value: 10, maxValue: 200, minAmount: 500, validFrom: now, validTo: futureDate, usageLimit: 5000, isActive: true },
    { code: 'LINEN15', type: 'percentage', value: 15, maxValue: 300, minAmount: 799, validFrom: now, validTo: futureDate, usageLimit: 1000, categories: ['linen'], isActive: true },
    { code: 'FLAT100', type: 'flat', value: 100, minAmount: 999, validFrom: now, validTo: futureDate, usageLimit: 2000, isActive: true },
    { code: 'FREESHIP', type: 'free_shipping', value: 0, minAmount: 799, validFrom: now, validTo: futureDate, usageLimit: 5000, isActive: true },
    { code: 'FIRST50', type: 'first_order', value: 50, maxValue: 500, minAmount: 799, validFrom: now, validTo: futureDate, usageLimit: 10000, isActive: true },
  ]);
  console.log('Created 5 coupons');

  // --- ORDERS ---
  const orderData = [
    { user: users[1]._id, items: [{ product: products[0]._id, variant: variants[0]._id, name: 'Desert Sand Linen Shirt', price: 799, quantity: 2, size: 'M', color: 'Desert Sand' }], totalAmount: 1598, discountAmount: 100, finalAmount: 1498, couponCode: 'FLAT100', shippingStatus: 'delivered', paymentStatus: 'paid', paymentMethod: 'razorpay', paymentId: 'pay_vchuki_001' },
    { user: users[2]._id, items: [{ product: products[1]._id, variant: variants[5]._id, name: 'Royal Indigo Linen Shirt', price: 899, quantity: 1, size: 'L', color: 'Royal Indigo' }, { product: products[4]._id, variant: variants[20]._id, name: 'Ivory Cream Linen Shirt', price: 799, quantity: 1, size: 'M', color: 'Ivory Cream' }], totalAmount: 1698, discountAmount: 169, finalAmount: 1529, couponCode: 'WELCOME10', shippingStatus: 'shipped', paymentStatus: 'paid', paymentMethod: 'cod' },
    { user: users[3]._id, items: [{ product: products[9]._id, variant: variants[100]._id, name: 'Heritage Gold Linen Shirt', price: 1299, quantity: 2, size: 'L', color: 'Heritage Gold' }], totalAmount: 2598, discountAmount: 300, finalAmount: 2298, couponCode: 'LINEN15', shippingStatus: 'delivered', paymentStatus: 'paid', paymentMethod: 'razorpay', paymentId: 'pay_vchuki_003' },
    { user: users[4]._id, items: [{ product: products[2]._id, variant: variants[10]._id, name: 'Sage Linen Shirt', price: 799, quantity: 3, size: 'XL', color: 'Sage' }], totalAmount: 2397, discountAmount: 0, finalAmount: 2397, shippingStatus: 'pending', paymentStatus: 'paid', paymentMethod: 'cod' },
  ];

  for (const order of orderData) {
    await Order.create({
      ...order,
      shippingAddress: users.find(u => u._id.equals(order.user))?.addresses?.[0] || { name: 'Demo', street: '123 Street', city: 'Jodhpur', state: 'Rajasthan', zip: '342001', phone: '9999999999' },
      timeline: [
        { event: 'Order placed', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { event: 'Payment confirmed', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60000) },
        ...(order.shippingStatus !== 'pending' ? [{ event: 'Shipped', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) }] : []),
        ...(order.shippingStatus === 'delivered' ? [{ event: 'Delivered', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }] : []),
      ],
    });
  }
  console.log(`Created ${orderData.length} orders`);

  // --- REVIEWS ---
  await Review.insertMany([
    { product: products[0]._id, user: users[1]._id, rating: 5, comment: 'The Desert Sand color is absolutely stunning. Fabric feels incredible — better than brands 3x the price. True Rajasthani craftsmanship.', verifiedPurchase: true },
    { product: products[0]._id, user: users[3]._id, rating: 5, comment: 'Ordered 3 more after the first one. The linen quality is unmatched at this price point. VCHUKI has replaced all my other brands.', verifiedPurchase: true },
    { product: products[1]._id, user: users[2]._id, rating: 5, comment: 'The Royal Indigo is a showstopper. Gets compliments every single time. Perfect fit, premium feel.', verifiedPurchase: true },
    { product: products[1]._id, user: users[4]._id, rating: 4, comment: 'Beautiful color and great fabric. Slightly long for my height but overall excellent quality.', verifiedPurchase: true },
    { product: products[2]._id, user: users[4]._id, rating: 5, comment: 'Sage is my new favorite color. So calming and elegant. The linen breathes beautifully in Jaipur summers.', verifiedPurchase: true },
    { product: products[4]._id, user: users[2]._id, rating: 5, comment: 'The Ivory Cream is pure class. Goes with everything. Fabric hasn\'t faded after 15 washes.', verifiedPurchase: true },
    { product: products[5]._id, user: users[1]._id, rating: 5, comment: 'Finally a formal shirt that doesn\'t feel like cardboard. The cotton-linen blend is genius.', verifiedPurchase: true },
    { product: products[7]._id, user: users[3]._id, rating: 4, comment: 'Great casual shirt for weekends. The natural indigo dye gives it character.', verifiedPurchase: true },
    { product: products[9]._id, user: users[3]._id, rating: 5, comment: 'Heritage Gold is the most beautiful shirt I own. Limited edition quality. Worth every rupee.', verifiedPurchase: true },
    { product: products[9]._id, user: users[4]._id, rating: 5, comment: 'Bought this as a gift. The packaging alone felt luxury. The shirt exceeded expectations.', verifiedPurchase: true },
  ]);
  console.log('Created 10 reviews');

  // Update wishlists
  await User.findByIdAndUpdate(users[1]._id, { wishlist: [products[9]._id, products[3]._id] });
  await User.findByIdAndUpdate(users[2]._id, { wishlist: [products[0]._id, products[2]._id, products[9]._id] });

  console.log('\n✅ Seed complete! VCHUKI Premium Linen Collection populated.');
  console.log('\n📋 Login credentials:');
  console.log('  Admin: admin@vchuki.com / password123');
  console.log('  User:  rahul@example.com / password123');
  console.log('  User:  vikram@example.com / password123');
  console.log('  User:  arjun@example.com / password123');
  console.log('  User:  karan@example.com / password123');
  console.log('\n🎨 Products: 12 premium shirts (Linen, Formal, Casual, Premium)');
  console.log(`🔄 Variants: ${variants.length} (multiple colors × 5 sizes each)`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
