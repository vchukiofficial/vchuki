import { Dimensions, StyleSheet, View } from 'react-native';
import type { Product } from '@/lib/types';
import { GUTTER } from '@/theme';
import { ProductCard } from './ProductCard';
import { Skeleton } from './ui';

export const GRID_W = (Dimensions.get('window').width - GUTTER * 2 - 14) / 2;

export function ProductGrid({ products, loading }: { products: Product[]; loading?: boolean }) {
  if (loading && !products.length) {
    return (
      <View style={st.grid}>
        {[0, 1, 2, 3].map((k) => (
          <Skeleton key={k} style={{ width: GRID_W, height: GRID_W * 1.3 + 50 }} />
        ))}
      </View>
    );
  }
  return (
    <View style={st.grid}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} width={GRID_W} />
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: GUTTER, rowGap: 24 },
});
