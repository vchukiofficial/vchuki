import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { Plus, Shirt } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Switch, View } from 'react-native';
import { HeaderAction, inr, SearchBar, Segments, StudioHeader } from '@/components/admin';
import { Empty, ErrorState, Pill, Skeleton, T, Tap } from '@/components/ui';
import { api, img } from '@/lib/api';
import { CATEGORIES } from '@/lib/catalog';
import type { Product } from '@/lib/types';
import { colors, GUTTER, radius } from '@/theme';

type Filter = 'all' | 'live' | 'hidden' | 'featured' | string;

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const r = await api<{ products: Product[] }>('/api/products?admin=true&limit=500');
      setItems(r.products);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload when coming back from the editor
  useFocusEffect(
    useCallback(() => {
      load(items.length > 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load]),
  );

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((p) => {
      if (t && !p.name.toLowerCase().includes(t) && !p.slug.includes(t)) return false;
      if (filter === 'live') return p.isActive;
      if (filter === 'hidden') return !p.isActive;
      if (filter === 'featured') return p.isFeatured;
      if (filter !== 'all') return p.category === filter;
      return true;
    });
  }, [items, q, filter]);

  async function toggle(p: Product, field: 'isActive' | 'isFeatured') {
    const next = !p[field];
    setItems((list) => list.map((x) => (x._id === p._id ? { ...x, [field]: next } : x)));
    try {
      await api(`/api/products/${p._id}`, { method: 'PATCH', body: { [field]: next } });
    } catch (e: any) {
      setItems((list) => list.map((x) => (x._id === p._id ? { ...x, [field]: !next } : x)));
      Alert.alert('Not saved', e.message);
    }
  }

  const segs = [
    { key: 'all', label: 'All', count: items.length },
    { key: 'live', label: 'Live', count: items.filter((p) => p.isActive).length },
    { key: 'hidden', label: 'Hidden', count: items.filter((p) => !p.isActive).length },
    { key: 'featured', label: 'Featured', count: items.filter((p) => p.isFeatured).length },
    ...CATEGORIES.map((c) => ({ key: c.slug, label: c.short, count: items.filter((p) => p.category === c.slug).length })),
  ];

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader
        title="Products"
        subtitle={`${items.filter((p) => p.isActive).length} live on vchuki.com`}
        right={<HeaderAction label="New product" icon={<Plus size={20} color={colors.onAccent} />} onPress={() => router.push({ pathname: '/admin/products/[id]', params: { id: 'new' } })} />}
      />
      <SearchBar value={q} onChange={setQ} placeholder="Search products" />
      <View>
        <Segments items={segs} value={filter} onChange={setFilter} />
      </View>
      {error && !items.length ? (
        <ErrorState message={error} onRetry={() => load()} />
      ) : loading && !items.length ? (
        <View style={{ paddingHorizontal: GUTTER, gap: 10 }}>
          {[0, 1, 2, 3].map((k) => (
            <Skeleton key={k} style={{ height: 92 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(p) => p._id}
          contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 60, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.accent} />}
          ListEmptyComponent={<Empty icon={<Shirt size={28} color={colors.accentDeep} strokeWidth={1.4} />} title="No products here" />}
          renderItem={({ item: p }) => (
            <Tap onPress={() => router.push({ pathname: '/admin/products/[id]', params: { id: p._id } })} style={[st.row, !p.isActive && { opacity: 0.6 }]}>
              <Image source={{ uri: img(p.images?.[0]) }} style={st.thumb} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <T v="title" numberOfLines={2} style={{ fontSize: 14 }}>
                  {p.name}
                </T>
                <T v="caption" style={{ marginTop: 2 }}>
                  {inr(p.basePrice)}
                  {p.comparePrice ? ` · MRP ${inr(p.comparePrice)}` : ''}
                </T>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                  {p.isFeatured && <Pill>Featured</Pill>}
                  {!p.isActive && <Pill tone="danger">Hidden</Pill>}
                </View>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Switch value={p.isActive} onValueChange={() => toggle(p, 'isActive')} trackColor={{ true: colors.success, false: colors.line }} thumbColor={colors.white} />
                <T v="caption" style={{ fontSize: 10 }}>
                  {p.isActive ? 'Live' : 'Hidden'}
                </T>
              </View>
            </Tap>
          )}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  thumb: { width: 58, height: 72, borderRadius: 8, backgroundColor: colors.sand },
});
