import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://Vercel-Admin-vchuki:0k6m4v1HkF0MEyCk@vchuki.8n7yfy8.mongodb.net/vchuki?retryWrites=true&w=majority';

// Schemas inline to avoid import issues with ts runner
const ProductSchema = new mongoose.Schema({
  name: String, slug: String, description: String, basePrice: Number,
  category: String, tags: [String], images: [String],
  isFeatured: { type: Boolean, default: false }, isActive: { type: Boolean, default: true },
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

  // Clear existing data
  await Promise.all([
    Product.deleteMany({}), ProductVariant.deleteMany({}),
    User.deleteMany({}), Order.deleteMany({}),
    Coupon.deleteMany({}), Review.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // --- USERS ---
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = await User.insertMany([
    { name: 'Admin', email: 'admin@vchuki.com', password: hashedPassword, role: 'admin', addresses: [{ name: 'Admin Office', street: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', zip: '400001', phone: '9876543210' }] },
    { name: 'Rahul Sharma', email: 'rahul@example.com', password: hashedPassword, role: 'user', addresses: [{ name: 'Home', street: '45 Nehru Nagar', city: 'Delhi', state: 'Delhi', zip: '110001', phone: '9876543211' }] },
    { name: 'Priya Patel', email: 'priya@example.com', password: hashedPassword, role: 'user', addresses: [{ name: 'Home', street: '78 Koramangala', city: 'Bangalore', state: 'Karnataka', zip: '560034', phone: '9876543212' }] },
    { name: 'Amit Kumar', email: 'amit@example.com', password: hashedPassword, role: 'user', addresses: [{ name: 'Home', street: '12 Salt Lake', city: 'Kolkata', state: 'West Bengal', zip: '700091', phone: '9876543213' }] },
  ]);
  console.log(`Created ${users.length} users`);

  // --- PRODUCTS ---
  const products = await Product.insertMany([
    { name: 'Classic Oxford Shirt', slug: 'classic-oxford-shirt', description: 'Premium cotton oxford shirt with button-down collar. Perfect for both casual and semi-formal occasions.', basePrice: 1499, category: 'formal', tags: ['oxford', 'cotton', 'classic'], images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'], isFeatured: true },
    { name: 'Slim Fit Linen Shirt', slug: 'slim-fit-linen-shirt', description: 'Breathable linen shirt ideal for summer. Slim fit with a modern spread collar.', basePrice: 1799, category: 'casual', tags: ['linen', 'summer', 'slim'], images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'], isFeatured: true },
    { name: 'Denim Casual Shirt', slug: 'denim-casual-shirt', description: 'Washed denim shirt with a relaxed fit. Great for weekend outings.', basePrice: 1299, category: 'casual', tags: ['denim', 'casual', 'weekend'], images: ['https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600'], isFeatured: true },
    { name: 'Mandarin Collar Shirt', slug: 'mandarin-collar-shirt', description: 'Contemporary mandarin collar shirt in premium cotton. A modern twist on traditional style.', basePrice: 1599, category: 'ethnic', tags: ['mandarin', 'cotton', 'modern'], images: ['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600'], isFeatured: false },
    { name: 'Printed Hawaiian Shirt', slug: 'printed-hawaiian-shirt', description: 'Vibrant tropical print shirt for vacation vibes. Relaxed fit in rayon fabric.', basePrice: 999, category: 'casual', tags: ['printed', 'hawaiian', 'vacation'], images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'], isFeatured: true },
    { name: 'Formal White Shirt', slug: 'formal-white-shirt', description: 'Crisp white formal shirt with French cuffs. Essential for every wardrobe.', basePrice: 1899, category: 'formal', tags: ['white', 'formal', 'french-cuff'], images: ['https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600'], isFeatured: true },
    { name: 'Flannel Check Shirt', slug: 'flannel-check-shirt', description: 'Warm flannel shirt with classic check pattern. Perfect for winter layering.', basePrice: 1399, category: 'casual', tags: ['flannel', 'check', 'winter'], images: ['https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600'], isFeatured: false },
    { name: 'Polo Collar T-Shirt', slug: 'polo-collar-tshirt', description: 'Premium pique cotton polo with embroidered logo. Smart casual essential.', basePrice: 899, category: 'casual', tags: ['polo', 'cotton', 'smart-casual'], images: ['https://images.unsplash.com/photo-1625910513413-5fc421e0fd4f?w=600'], isFeatured: true },
  ]);
  console.log(`Created ${products.length} products`);

  // --- VARIANTS ---
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'White', hex: '#FFFFFF' }, { name: 'Navy', hex: '#1B2A4A' },
    { name: 'Sky Blue', hex: '#87CEEB' }, { name: 'Black', hex: '#000000' },
    { name: 'Olive', hex: '#556B2F' }, { name: 'Maroon', hex: '#800000' },
  ];

  const variants: any[] = [];
  for (const product of products) {
    const productColors = colors.slice(0, 3); // 3 colors per product
    for (const color of productColors) {
      for (const size of sizes) {
        variants.push({
          product: product._id,
          color, size,
          fabric: product.category === 'formal' ? '100% Cotton' : 'Cotton Blend',
          fit: product.tags.includes('slim') ? 'slim' : 'regular',
          stock: Math.floor(Math.random() * 50) + 5,
          priceAdjustment: size === 'XXL' ? 100 : 0,
          sku: `${product.slug}-${color.name.toLowerCase()}-${size}`.replace(/\s/g, '-'),
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
    { code: 'WELCOME10', type: 'percentage', value: 10, maxValue: 200, minAmount: 500, validFrom: now, validTo: futureDate, usageLimit: 1000, isActive: true },
    { code: 'FLAT200', type: 'flat', value: 200, minAmount: 1500, validFrom: now, validTo: futureDate, usageLimit: 500, isActive: true },
    { code: 'SUMMER25', type: 'percentage', value: 25, maxValue: 500, minAmount: 2000, validFrom: now, validTo: futureDate, usageLimit: 200, categories: ['casual'], isActive: true },
    { code: 'FREESHIP', type: 'free_shipping', value: 0, minAmount: 999, validFrom: now, validTo: futureDate, usageLimit: 1000, isActive: true },
    { code: 'FIRST50', type: 'first_order', value: 50, maxValue: 1000, minAmount: 1000, validFrom: now, validTo: futureDate, usageLimit: 5000, isActive: true },
  ]);
  console.log('Created 5 coupons');

  // --- ORDERS ---
  const orderData = [
    { user: users[1]._id, items: [{ product: products[0]._id, variant: variants[0]._id, name: 'Classic Oxford Shirt', price: 1499, quantity: 2, size: 'M', color: 'White' }], totalAmount: 2998, discountAmount: 200, finalAmount: 2798, couponCode: 'FLAT200', shippingStatus: 'delivered', paymentStatus: 'paid', paymentMethod: 'razorpay', paymentId: 'pay_demo_001' },
    { user: users[2]._id, items: [{ product: products[1]._id, variant: variants[15]._id, name: 'Slim Fit Linen Shirt', price: 1799, quantity: 1, size: 'S', color: 'Navy' }, { product: products[4]._id, variant: variants[60]._id, name: 'Printed Hawaiian Shirt', price: 999, quantity: 1, size: 'M', color: 'White' }], totalAmount: 2798, discountAmount: 279, finalAmount: 2519, couponCode: 'WELCOME10', shippingStatus: 'shipped', paymentStatus: 'paid', paymentMethod: 'cod' },
    { user: users[3]._id, items: [{ product: products[5]._id, variant: variants[75]._id, name: 'Formal White Shirt', price: 1899, quantity: 3, size: 'L', color: 'White' }], totalAmount: 5697, discountAmount: 500, finalAmount: 5197, couponCode: 'SUMMER25', shippingStatus: 'pending', paymentStatus: 'paid', paymentMethod: 'razorpay', paymentId: 'pay_demo_003' },
    { user: users[1]._id, items: [{ product: products[7]._id, variant: variants[105]._id, name: 'Polo Collar T-Shirt', price: 899, quantity: 2, size: 'XL', color: 'Sky Blue' }], totalAmount: 1798, discountAmount: 0, finalAmount: 1798, shippingStatus: 'delivered', paymentStatus: 'paid', paymentMethod: 'cod' },
  ];

  for (const order of orderData) {
    await Order.create({
      ...order,
      shippingAddress: users.find(u => u._id.equals(order.user))?.addresses?.[0] || { name: 'Demo', street: '123 Street', city: 'Mumbai', state: 'MH', zip: '400001', phone: '9999999999' },
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
    { product: products[0]._id, user: users[1]._id, rating: 5, comment: 'Excellent quality oxford shirt! Fabric feels premium and the fit is perfect.', verifiedPurchase: true },
    { product: products[0]._id, user: users[2]._id, rating: 4, comment: 'Good shirt, slightly tight around shoulders for me. Quality is great though.', verifiedPurchase: true },
    { product: products[1]._id, user: users[2]._id, rating: 5, comment: 'Perfect for Bangalore summers! Very breathable and looks stylish.', verifiedPurchase: true },
    { product: products[4]._id, user: users[3]._id, rating: 4, comment: 'Fun print, great for beach trips. Fabric could be slightly better.', verifiedPurchase: true },
    { product: products[5]._id, user: users[3]._id, rating: 5, comment: 'Best formal shirt I own. French cuffs add a classy touch.', verifiedPurchase: true },
    { product: products[7]._id, user: users[1]._id, rating: 4, comment: 'Comfortable polo, good for daily wear. Color is vibrant.', verifiedPurchase: true },
    { product: products[2]._id, user: users[1]._id, rating: 3, comment: 'Decent denim shirt but faded after 2 washes. Average quality.', verifiedPurchase: true },
    { product: products[3]._id, user: users[2]._id, rating: 5, comment: 'Love the mandarin collar design! Gets compliments every time I wear it.', verifiedPurchase: true },
  ]);
  console.log('Created 8 reviews');

  // Update wishlist for users
  await User.findByIdAndUpdate(users[1]._id, { wishlist: [products[3]._id, products[6]._id] });
  await User.findByIdAndUpdate(users[2]._id, { wishlist: [products[0]._id, products[7]._id] });

  console.log('\n✅ Seed complete! Demo data populated successfully.');
  console.log('\n📋 Login credentials:');
  console.log('  Admin: admin@vchuki.com / password123');
  console.log('  User:  rahul@example.com / password123');
  console.log('  User:  priya@example.com / password123');
  console.log('  User:  amit@example.com / password123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
