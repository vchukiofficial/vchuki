import { Image } from 'expo-image';
import { MessageSquareQuote } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { confirm, fmtDateTime, Segments, StudioHeader } from '@/components/admin';
import { Button, Empty, ErrorState, Pill, Skeleton, Stars, T } from '@/components/ui';
import { api, img } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { colors, fonts, GUTTER, radius } from '@/theme';

interface AdminReview {
  _id: string;
  rating: number;
  comment?: string;
  images: string[];
  status: 'pending' | 'approved' | 'hidden';
  featured: boolean;
  verifiedPurchase: boolean;
  createdAt: string;
  user?: { name?: string } | null;
  product?: { name?: string; slug?: string } | null;
}
type Filter = 'all' | 'approved' | 'hidden' | 'featured' | 'low';

export default function Reviews() {
  const { data, loading, error, reload, refresh, refreshing, setData } = useFetch<{ reviews: AdminReview[] }>('/api/reviews');
  const [filter, setFilter] = useState<Filter>('all');
  const list = data?.reviews || [];

  const shown = useMemo(
    () =>
      list.filter((r) =>
        filter === 'approved' ? r.status !== 'hidden' : filter === 'hidden' ? r.status === 'hidden' : filter === 'featured' ? r.featured : filter === 'low' ? r.rating <= 3 : true,
      ),
    [list, filter],
  );

  async function patch(r: AdminReview, body: Partial<AdminReview>) {
    setData({ reviews: list.map((x) => (x._id === r._id ? { ...x, ...body } : x)) });
    try {
      await api(`/api/reviews/${r._id}`, { method: 'PATCH', body });
    } catch (e: any) {
      Alert.alert('Not saved', e.message);
      reload();
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader title="Reviews" subtitle={`${list.length} reviews · ${list.filter((r) => r.status === 'hidden').length} hidden`} />
      <View>
        <Segments
          items={[
            { key: 'all', label: 'All', count: list.length },
            { key: 'approved', label: 'Visible' },
            { key: 'hidden', label: 'Hidden' },
            { key: 'featured', label: 'Featured' },
            { key: 'low', label: '3★ or less' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </View>
      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <View style={{ paddingHorizontal: GUTTER }}>
          <Skeleton style={{ height: 160 }} />
        </View>
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(r) => r._id}
          contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 10, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
          ListEmptyComponent={<Empty icon={<MessageSquareQuote size={28} color={colors.accentDeep} strokeWidth={1.4} />} title="No reviews here" />}
          renderItem={({ item: r }) => (
            <View style={[st.card, r.status === 'hidden' && { opacity: 0.6 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stars value={r.rating} />
                <T v="caption">{fmtDateTime(r.createdAt)}</T>
              </View>
              <T v="caption" style={{ marginTop: 6, color: colors.ink, fontFamily: fonts.semibold }} numberOfLines={1}>
                {r.product?.name || 'Deleted product'}
              </T>
              {!!r.comment && (
                <T v="small" style={{ color: colors.inkSoft, marginTop: 4 }}>
                  {r.comment}
                </T>
              )}
              {r.images?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginTop: 10 }}>
                  {r.images.map((u, i) => (
                    <Image key={i} source={{ uri: img(u) }} style={{ width: 64, height: 64, borderRadius: 6, backgroundColor: colors.sand }} contentFit="cover" />
                  ))}
                </ScrollView>
              )}
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, alignItems: 'center' }}>
                <T v="caption" style={{ flex: 1 }}>
                  {r.user?.name || 'Customer'}
                </T>
                {r.verifiedPurchase && <Pill tone="success">Verified</Pill>}
                {r.featured && <Pill>Featured</Pill>}
                {r.status === 'hidden' && <Pill tone="danger">Hidden</Pill>}
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Button title={r.status === 'hidden' ? 'Show' : 'Hide'} kind="outline" compact onPress={() => patch(r, { status: r.status === 'hidden' ? 'approved' : 'hidden' })} style={{ flex: 1 }} />
                <Button title={r.featured ? 'Unfeature' : 'Feature'} kind="outline" compact onPress={() => patch(r, { featured: !r.featured })} style={{ flex: 1 }} />
                <Button
                  title="Delete"
                  kind="ghost"
                  compact
                  onPress={() =>
                    confirm('Delete review?', 'This can’t be undone. Hiding keeps it on record.', 'Delete', async () => {
                      await api(`/api/reviews/${r._id}`, { method: 'DELETE' }).catch((e) => Alert.alert('Not deleted', e.message));
                      setData({ reviews: list.filter((x) => x._id !== r._id) });
                    })
                  }
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
