// Migration: Update product categories and tags to match new structure
// Run with: npx tsx scripts/migrate-categories.ts

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Vercel-Admin-vchuki:0k6m4v1HkF0MEyCk@vchuki.8n7yfy8.mongodb.net/vchuki?retryWrites=true&w=majority';

const ProductSchema = new mongoose.Schema({
  name: String, slug: String, description: String, basePrice: Number,
  category: String, tags: [String], images: [String],
  isFeatured: Boolean, isActive: Boolean,
  rating: Number, reviewCount: Number,
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const products = await Product.find({});
  console.log(`Found ${products.length} products to migrate`);

  for (const product of products) {
    const name = product.name?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    const existingTags: string[] = product.tags || [];
    const newTags = new Set(existingTags);

    // Determine sleeve type and product type
    if (name.includes('kurta')) {
      newTags.add('kurta');
      if (name.includes('half sleeve') || name.includes('half-sleeve')) {
        newTags.add('half-sleeve');
      } else {
        newTags.add('full-sleeve');
      }
    } else {
      // It's a shirt
      if (name.includes('half sleeve') || name.includes('half-sleeve')) {
        newTags.add('half-sleeve');
      } else {
        // Default shirts are full sleeve
        newTags.add('full-sleeve');
      }
    }

    // Add fabric tags
    if (category === 'linen' || name.includes('linen')) {
      newTags.add('linen');
    }
    if (category === 'formal') {
      newTags.add('formal');
      newTags.add('full-sleeve');
    }
    if (category === 'casual') {
      newTags.add('casual');
    }
    if (category === 'premium') {
      newTags.add('premium');
      newTags.add('linen');
    }

    const updatedTags = Array.from(newTags);

    if (JSON.stringify(updatedTags.sort()) !== JSON.stringify(existingTags.sort())) {
      await Product.findByIdAndUpdate(product._id, { tags: updatedTags });
      console.log(`  ✓ ${product.name}: +[${updatedTags.filter(t => !existingTags.includes(t)).join(', ')}]`);
    }
  }

  console.log('\n✅ Migration complete! All products now have sleeve-type tags.');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
