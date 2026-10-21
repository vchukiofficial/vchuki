import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Share2 } from 'lucide-react-native';
import { Dimensions, FlatList, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/ProductCard';
import { RichText } from '@/components/RichText';
import { ErrorState, Header, IconBtn, Skeleton, T } from '@/components/ui';
import { img, webUrl } from '@/lib/api';
import { fmtDate } from '@/lib/orderStatus';
import type { BlogSummary, Product } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useBackToHome } from '@/lib/useSystemBack';
import { colors, GUTTER, radius } from '@/theme';

const W = Dimensions.get('window').width;

export default function Article() {
  useBackToHome();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { data, error, loading, reload } = useFetch<{ blog: BlogSummary & { content: string }; relatedProducts: Product[] }>(slug ? `/api/mobile/blogs/${encodeURIComponent(slug)}` : null);
  const b = data?.blog;

  return (
    <View style={{ flex: 1 }}>
      <Header
        title=""
        right={
          b ? (
            <IconBtn label="Share" onPress={() => Share.share({ message: `${b.title}\n${webUrl(`/blog/${b.slug}`)}` })}>
              <Share2 size={18} color={colors.ink} />
            </IconBtn>
          ) : null
        }
      />
      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !b ? (
        <View style={{ padding: GUTTER, gap: 14 }}>
          <Skeleton style={{ height: 30, width: '80%' }} />
          <Skeleton style={{ height: 220 }} />
          <Skeleton style={{ height: 14 }} />
          <Skeleton style={{ height: 14, width: '90%' }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
          <View style={{ paddingHorizontal: GUTTER }}>
            <T v="eyebrow">{b.category}</T>
            <T v="h1" style={{ marginTop: 8, fontSize: 30, lineHeight: 37 }}>
              {b.title}
            </T>
            <T v="caption" style={{ marginTop: 10 }}>
              {b.author || 'VCHUKI Team'} · {fmtDate(b.createdAt)} · {b.readTime} read
            </T>
          </View>
          {!!b.coverImage && <Image source={{ uri: img(b.coverImage) }} style={{ width: W - GUTTER * 2, marginHorizontal: GUTTER, height: (W - GUTTER * 2) * 0.66, borderRadius: radius.lg, marginTop: 22, backgroundColor: colors.sand }} contentFit="cover" />}
          <View style={{ paddingHorizontal: GUTTER, marginTop: 22 }}>
            <RichText html={b.content} />
          </View>
          {!!data?.relatedProducts?.length && (
            <View style={{ marginTop: 24 }}>
              <T v="h2" style={{ paddingHorizontal: GUTTER, marginBottom: 16 }}>
                Shop the story
              </T>
              <FlatList
                horizontal
                data={data.relatedProducts}
                keyExtractor={(p) => p._id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 14 }}
                renderItem={({ item }) => <ProductCard product={item} width={W * 0.42} />}
              />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
