import { Image } from 'expo-image';
import { router } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Empty, ErrorState, Header, Skeleton, T, Tap } from '@/components/ui';
import { img } from '@/lib/api';
import { fmtDate } from '@/lib/orderStatus';
import type { BlogSummary } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useBackToHome } from '@/lib/useSystemBack';
import { colors, GUTTER, radius } from '@/theme';

export default function Journal() {
  useBackToHome();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refreshing, refresh, reload } = useFetch<{ blogs: BlogSummary[] }>('/api/mobile/blogs');
  const [lead, ...rest] = data?.blogs || [];

  return (
    <View style={{ flex: 1 }}>
      <Header title="The journal" />
      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <View style={{ padding: GUTTER, gap: 16 }}>
          <Skeleton style={{ height: 240 }} />
          <Skeleton style={{ height: 90 }} />
          <Skeleton style={{ height: 90 }} />
        </View>
      ) : !lead ? (
        <Empty icon={<BookOpen size={30} color={colors.accentDeep} strokeWidth={1.4} />} title="Stories coming soon" body="Notes on linen, care and summer style." />
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(b) => b._id}
          contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: insets.bottom + 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
          ListHeaderComponent={
            <Tap onPress={() => router.push({ pathname: '/journal/[slug]', params: { slug: lead.slug } })} style={{ marginBottom: 26 }}>
              <View style={st.leadImg}>{!!lead.coverImage && <Image source={{ uri: img(lead.coverImage) }} style={StyleSheet.absoluteFill} contentFit="cover" />}</View>
              <T v="eyebrow" style={{ marginTop: 14 }}>
                {lead.category} · {lead.readTime}
              </T>
              <T v="h1" style={{ marginTop: 6, fontSize: 26, lineHeight: 32 }}>
                {lead.title}
              </T>
              <T v="body" numberOfLines={3} style={{ marginTop: 8 }}>
                {lead.excerpt}
              </T>
            </Tap>
          }
          renderItem={({ item }) => (
            <Tap onPress={() => router.push({ pathname: '/journal/[slug]', params: { slug: item.slug } })} style={st.row}>
              <View style={{ flex: 1 }}>
                <T v="caption">{fmtDate(item.createdAt)}</T>
                <T v="h3" numberOfLines={3} style={{ marginTop: 4, fontSize: 17 }}>
                  {item.title}
                </T>
                <T v="caption" style={{ marginTop: 6 }}>
                  {item.readTime} read
                </T>
              </View>
              <View style={st.thumb}>{!!item.coverImage && <Image source={{ uri: img(item.coverImage) }} style={StyleSheet.absoluteFill} contentFit="cover" />}</View>
            </Tap>
          )}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  leadImg: { height: 240, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.sand },
  row: { flexDirection: 'row', gap: 16, paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  thumb: { width: 96, height: 96, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.sand },
});
