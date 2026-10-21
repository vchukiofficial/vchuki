import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductGrid } from '@/components/ProductGrid';
import { Empty, T, Tap } from '@/components/ui';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { useWishlist } from '@/store/wishlist';
import { colors, fonts, GUTTER, TAB_SPACE } from '@/theme';

export default function Wishlist() {
  const insets = useSafeAreaInsets();
  const ids = useWishlist((s) => s.ids);
  const signedIn = useAuth((s) => !!s.token);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const key = ids.join(',');

  async function load() {
    if (!ids.length) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      const r = await api<{ products: Product[] }>(`/api/products?ids=${key}&limit=100`);
      // Keep most-recently-saved first
      setProducts(ids.map((id) => r.products.find((p) => p._id === id)).filter(Boolean) as Product[]);
    } catch {
      /* keep what we had */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: TAB_SPACE }}
      refreshControl={<RefreshControl refreshing={loading && products.length > 0} onRefresh={load} tintColor={colors.accent} />}>
      <View style={{ paddingHorizontal: GUTTER, marginBottom: 20 }}>
        <T v="eyebrow">{ids.length} saved</T>
        <T v="h1" style={{ marginTop: 4 }}>
          Wishlist
        </T>
        {!signedIn && ids.length > 0 && (
          <Tap onPress={() => router.push('/auth/login')} style={{ marginTop: 8 }}>
            <T v="small">
              Saved on this phone.{' '}
              <T v="small" style={{ color: colors.ink, fontFamily: fonts.semibold, textDecorationLine: 'underline' }}>
                Sign in
              </T>{' '}
              to keep it across devices.
            </T>
          </Tap>
        )}
      </View>
      {ids.length === 0 ? (
        <Empty
          icon={<Heart size={30} color={colors.accentDeep} strokeWidth={1.4} />}
          title="Nothing saved yet"
          body="Tap the heart on any piece to keep it here."
          action="Explore the collection"
          onAction={() => router.push('/(tabs)/shop')}
        />
      ) : (
        <ProductGrid products={products} loading={loading} />
      )}
    </ScrollView>
  );
}
