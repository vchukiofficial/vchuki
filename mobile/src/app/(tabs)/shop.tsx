import { useLocalSearchParams } from 'expo-router';
import { ArrowDownUp, Search, X } from 'lucide-react-native';
import { type ComponentRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/ProductCard';
import { GRID_W } from '@/components/ProductGrid';
import { Chip, Empty, ErrorState, Skeleton, T, Tap } from '@/components/ui';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/catalog';
import type { Product } from '@/lib/types';
import { colors, fonts, GUTTER, radius, TAB_SPACE } from '@/theme';

type Sort = 'new' | 'low' | 'high';
const PRICES = [
  { key: 'u800', label: 'Under ₹800', min: 0, max: 799 },
  { key: '800-1000', label: '₹800–1,000', min: 800, max: 1000 },
  { key: 'o1000', label: 'Above ₹1,000', min: 1001, max: 1e9 },
];
const SORTS: { key: Sort; label: string }[] = [
  { key: 'new', label: 'Newest' },
  { key: 'low', label: 'Price: low to high' },
  { key: 'high', label: 'Price: high to low' },
];

export default function Shop() {
  const params = useLocalSearchParams<{ category?: string; focus?: string }>();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<string>(params.category || '');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState<Sort>('new');
  const [sortOpen, setSortOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const req = useRef(0);

  // Deep links from Home ("Shop by style", search icon)
  useEffect(() => {
    if (params.category !== undefined) setCategory(params.category || '');
  }, [params.category]);
  useEffect(() => {
    if (params.focus) setTimeout(() => inputRef.current?.focus(), 350);
  }, [params.focus]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(
    async (p: number, mode: 'reset' | 'more' | 'refresh') => {
      const id = ++req.current;
      mode === 'more' ? setMore(true) : mode === 'refresh' ? setRefreshing(true) : setLoading(true);
      try {
        const qs = new URLSearchParams({ page: String(p), limit: '12' });
        if (category) qs.set('category', category);
        if (debounced) qs.set('search', debounced);
        const res = await api<{ products: Product[]; pagination: { page: number; pages: number; total: number } }>(`/api/products?${qs}`);
        if (id !== req.current) return;
        setItems((prev) => (p === 1 ? res.products : [...prev, ...res.products.filter((n) => !prev.some((o) => o._id === n._id))]));
        setPage(res.pagination.page);
        setPages(res.pagination.pages);
        setTotal(res.pagination.total);
        setError(null);
      } catch (e: any) {
        if (id === req.current) setError(e.message);
      } finally {
        if (id === req.current) {
          setLoading(false);
          setMore(false);
          setRefreshing(false);
        }
      }
    },
    [category, debounced],
  );

  useEffect(() => {
    load(1, 'reset');
  }, [load]);

  const sorted = useMemo(() => {
    const range = PRICES.find((r) => r.key === price);
    const base = range ? items.filter((p) => p.basePrice >= range.min && p.basePrice <= range.max) : items;
    if (sort === 'new') return base;
    const copy = [...base];
    copy.sort((a, b) => (sort === 'low' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice));
    return copy;
  }, [items, sort, price]);

  const heading = CATEGORIES.find((c) => c.slug === category)?.name || 'All shirts & kurtas';

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 8 }}>
        <T v="eyebrow">Shop</T>
        <T v="h1" style={{ marginTop: 4 }}>
          {heading}
        </T>
        <View style={st.search}>
          <Search size={18} color={colors.muted} strokeWidth={1.7} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search linen, kurta, colour…"
            placeholderTextColor={colors.faint}
            style={st.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            selectionColor={colors.accent}
          />
          {!!query && (
            <Tap onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
              <X size={17} color={colors.muted} />
            </Tap>
          )}
        </View>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 8, paddingVertical: 14 }}>
          <Chip label="All" active={!category} onPress={() => setCategory('')} />
          {CATEGORIES.map((c) => (
            <Chip key={c.slug} label={c.short} active={category === c.slug} onPress={() => setCategory(c.slug)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 8, paddingBottom: 12 }}>
        {PRICES.map((r) => (
          <Chip key={r.key} label={r.label} active={price === r.key} onPress={() => setPrice(price === r.key ? '' : r.key)} />
        ))}
      </ScrollView>
      <View style={{ zIndex: 30 }}>
      <View style={st.toolbar}>
        <T v="caption">{loading ? 'Loading…' : price ? `${sorted.length} of ${total} styles` : `${total} ${total === 1 ? 'style' : 'styles'}`}</T>
        <Tap onPress={() => setSortOpen((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} hitSlop={8}>
          <ArrowDownUp size={14} color={colors.ink} />
          <T v="caption" style={{ color: colors.ink, fontFamily: fonts.semibold }}>
            {SORTS.find((s) => s.key === sort)?.label}
          </T>
        </Tap>
      </View>
      {sortOpen && (
        <View style={st.sortMenu}>
          {SORTS.map((s) => (
            <Tap
              key={s.key}
              onPress={() => {
                setSort(s.key);
                setSortOpen(false);
              }}
              style={st.sortItem}>
              <T v="small" style={{ color: colors.ink, fontFamily: sort === s.key ? fonts.semibold : fonts.body }}>
                {s.label}
              </T>
            </Tap>
          ))}
        </View>
      )}
      </View>

      {error && !items.length ? (
        <ErrorState message={error} onRetry={() => load(1, 'reset')} />
      ) : loading && !items.length ? (
        <View style={st.skeletons}>
          {[0, 1, 2, 3].map((k) => (
            <Skeleton key={k} style={{ width: GRID_W, height: GRID_W * 1.3 + 50 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(p) => p._id}
          numColumns={2}
          columnWrapperStyle={{ gap: 14, paddingHorizontal: GUTTER }}
          contentContainerStyle={{ paddingBottom: TAB_SPACE, rowGap: 24, paddingTop: 4 }}
          renderItem={({ item }) => <ProductCard product={item} width={GRID_W} />}
          onEndReachedThreshold={0.6}
          onEndReached={() => {
            if (!more && !loading && page < pages) load(page + 1, 'more');
          }}
          keyboardDismissMode="on-drag"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(1, 'refresh')} tintColor={colors.accent} />}
          ListFooterComponent={more ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} /> : undefined}
          ListEmptyComponent={
            <Empty
              icon={<Search size={30} color={colors.accentDeep} strokeWidth={1.5} />}
              title="Nothing matches yet"
              body={debounced ? `No styles for “${debounced}”. Try another colour or style.` : 'This collection is restocking soon.'}
            />
          }
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  search: {
    marginTop: 14,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.ink, height: 48 },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: GUTTER, paddingBottom: 12 },
  sortMenu: {
    position: 'absolute',
    right: GUTTER,
    top: 28,
    zIndex: 30,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  sortItem: { paddingHorizontal: 16, paddingVertical: 11 },
  skeletons: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: GUTTER, rowGap: 24 },
});
