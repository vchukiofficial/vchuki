import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { ChevronRight, Package } from 'lucide-react-native';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Empty, ErrorState, Header, Pill, Skeleton, T, Tap } from '@/components/ui';
import { img } from '@/lib/api';
import { fmtDate, orderRef, STATUS_LABEL, STATUS_TONE } from '@/lib/orderStatus';
import { rupee } from '@/lib/pricing';
import type { Order } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useBackToHome } from '@/lib/useSystemBack';
import { useAuth } from '@/store/auth';
import { colors, GUTTER, radius } from '@/theme';

export default function Orders() {
  useBackToHome();
  const token = useAuth((s) => s.token);
  const insets = useSafeAreaInsets();
  const { data, loading, error, refreshing, refresh, reload } = useFetch<{ orders: Order[] }>(token ? '/api/orders' : null);

  if (!token) return <Redirect href={{ pathname: '/auth/login', params: { reason: 'orders' } }} />;

  return (
    <View style={{ flex: 1 }}>
      <Header title="Your orders" />
      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <View style={{ padding: GUTTER, gap: 14 }}>
          {[0, 1, 2].map((k) => (
            <Skeleton key={k} style={{ height: 110 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={data?.orders || []}
          keyExtractor={(o) => o._id}
          contentContainerStyle={{ padding: GUTTER, gap: 12, paddingBottom: insets.bottom + 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
          ListEmptyComponent={
            <Empty
              icon={<Package size={30} color={colors.accentDeep} strokeWidth={1.4} />}
              title="No orders yet"
              body="When you place an order, you’ll track it here."
              action="Start shopping"
              onAction={() => router.replace('/(tabs)/shop')}
            />
          }
          renderItem={({ item: o }) => {
            const units = o.items.reduce((n, i) => n + i.quantity, 0);
            return (
              <Tap onPress={() => router.push({ pathname: '/orders/[id]', params: { id: o._id } })} style={st.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <T v="title" style={{ fontSize: 14 }}>
                      #{orderRef(o)}
                    </T>
                    <T v="caption">{fmtDate(o.createdAt)}</T>
                  </View>
                  <Pill tone={o.paymentMethod === 'upi' && o.paymentStatus === 'pending' && o.shippingStatus === 'pending' ? 'warning' : STATUS_TONE[o.shippingStatus]}>
                    {o.paymentMethod === 'upi' && o.paymentStatus === 'pending' && o.shippingStatus === 'pending' ? 'Payment pending' : STATUS_LABEL[o.shippingStatus]}
                  </Pill>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
                  <View style={{ flexDirection: 'row' }}>
                    {o.items.slice(0, 3).map((i, k) => (
                      <Image key={k} source={{ uri: img(i.image) }} style={[st.thumb, k > 0 && { marginLeft: -14 }]} contentFit="cover" />
                    ))}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <T v="small" numberOfLines={1} style={{ color: colors.ink }}>
                      {o.items[0]?.name}
                      {o.items.length > 1 ? ` + ${o.items.length - 1} more` : ''}
                    </T>
                    <T v="caption">
                      {units} {units === 1 ? 'item' : 'items'} · {rupee(o.finalAmount)}
                    </T>
                  </View>
                  <ChevronRight size={18} color={colors.faint} />
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
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  thumb: { width: 44, height: 54, borderRadius: radius.sm, backgroundColor: colors.sand, borderWidth: 2, borderColor: colors.surface },
});
