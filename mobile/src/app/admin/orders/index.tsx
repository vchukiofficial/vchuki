import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Package } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { fmtDateTime, inr, SearchBar, Segments, StudioHeader } from '@/components/admin';
import { Empty, ErrorState, Pill, Skeleton, T, Tap } from '@/components/ui';
import { api, img } from '@/lib/api';
import { orderRef, STATUS_LABEL, STATUS_TONE } from '@/lib/orderStatus';
import type { Order } from '@/lib/types';
import { colors, GUTTER, radius } from '@/theme';

type Tab = 'new' | 'to_ship' | 'in_transit' | 'delivered' | 'upi_pending' | 'returns' | 'cancelled' | 'store' | 'all';
const TABS: { key: Tab; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'to_ship', label: 'To ship' },
  { key: 'in_transit', label: 'In transit' },
  { key: 'upi_pending', label: 'UPI unpaid' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'returns', label: 'Returns' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'store', label: 'Shop sales' },
  { key: 'all', label: 'All' },
];

type AdminOrder = Order & { channel?: 'online' | 'store'; guestEmail?: string; user?: { name?: string; email?: string } | string };

export default function AdminOrders() {
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab || 'new');
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const req = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDq(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(
    async (p: number, mode: 'reset' | 'more' | 'refresh') => {
      const id = ++req.current;
      mode === 'more' ? setMore(true) : mode === 'refresh' ? setRefreshing(true) : setLoading(true);
      try {
        const qs = new URLSearchParams({ tab, page: String(p) });
        if (dq) qs.set('q', dq);
        const r = await api<{ orders: AdminOrder[]; counts: Record<string, number>; pagination: { page: number; pages: number } }>(`/api/mobile/admin/orders?${qs}`);
        if (id !== req.current) return;
        setItems((prev) => (p === 1 ? r.orders : [...prev, ...r.orders]));
        setCounts(r.counts);
        setPage(r.pagination.page);
        setPages(r.pagination.pages);
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
    [tab, dq],
  );

  useEffect(() => {
    load(1, 'reset');
  }, [load]);

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader title="Orders" subtitle={`${counts.all ?? '…'} orders in total`} />
      <SearchBar value={q} onChange={setQ} placeholder="Name, phone, email, AWB or #ref" />
      <View>
        <Segments items={TABS.map((t) => ({ ...t, count: counts[t.key] }))} value={tab} onChange={setTab} />
      </View>
      {error && !items.length ? (
        <ErrorState message={error} onRetry={() => load(1, 'reset')} />
      ) : loading && !items.length ? (
        <View style={{ paddingHorizontal: GUTTER, gap: 10 }}>
          {[0, 1, 2, 3].map((k) => (
            <Skeleton key={k} style={{ height: 96 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(o) => o._id}
          contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 60, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(1, 'refresh')} tintColor={colors.accent} />}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!more && page < pages) load(page + 1, 'more');
          }}
          ListFooterComponent={more ? <ActivityIndicator color={colors.accent} style={{ margin: 16 }} /> : undefined}
          ListEmptyComponent={<Empty icon={<Package size={28} color={colors.accentDeep} strokeWidth={1.4} />} title="All clear" body="No orders in this list right now." />}
          renderItem={({ item: o }) => {
            const units = o.items.reduce((n, i) => n + i.quantity, 0);
            const unpaidUpi = o.paymentMethod === 'upi' && o.paymentStatus === 'pending';
            return (
              <Tap onPress={() => router.push({ pathname: '/admin/orders/[id]', params: { id: o._id } })} style={st.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <T v="title" style={{ fontSize: 14, flex: 1 }} numberOfLines={1}>
                    #{orderRef(o)} · {o.shippingAddress?.name || 'Customer'}
                  </T>
                  <T v="price" style={{ fontSize: 14 }}>
                    {inr(o.finalAmount)}
                  </T>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 }}>
                  <Image source={{ uri: img(o.items[0]?.image) }} style={st.thumb} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <T v="caption" numberOfLines={1} style={{ color: colors.ink }}>
                      {units} {units === 1 ? 'piece' : 'pieces'} · {o.items.map((i) => i.size).join(', ')}
                    </T>
                    <T v="caption" numberOfLines={1}>
                      {o.channel === 'store' ? 'Shop counter' : `${o.shippingAddress?.city || ''}`} · {fmtDateTime(o.createdAt)}
                    </T>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  <Pill tone={STATUS_TONE[o.shippingStatus]}>{STATUS_LABEL[o.shippingStatus]}</Pill>
                  <Pill tone={o.paymentStatus === 'paid' ? 'success' : unpaidUpi ? 'warning' : 'accent'}>
                    {`${o.paymentMethod.toUpperCase()} · ${o.paymentStatus}`}
                  </Pill>
                  {!!o.returnRequest && <Pill tone="danger">Return requested</Pill>}
                </View>
              </Tap>
            );
          }}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  thumb: { width: 36, height: 44, borderRadius: 6, backgroundColor: colors.sand },
});
