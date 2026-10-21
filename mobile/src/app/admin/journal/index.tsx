import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { BookOpen, Plus } from 'lucide-react-native';
import { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { fmtDateTime, HeaderAction, StudioHeader } from '@/components/admin';
import { Empty, ErrorState, Pill, Skeleton, T, Tap } from '@/components/ui';
import { img } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { colors, GUTTER, radius } from '@/theme';

export interface AdminBlog { _id: string; title: string; slug: string; excerpt: string; content: string; coverImage: string; category: string; tags: string[]; readTime: string; isPublished: boolean; isFeatured: boolean; createdAt: string }

export default function AdminJournal() {
  const { data, loading, error, reload, refresh, refreshing } = useFetch<{ blogs: AdminBlog[]; total: number }>('/api/admin/blogs?limit=100');
  useFocusEffect(
    useCallback(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  const list = data?.blogs || [];

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader
        title="Journal"
        subtitle={`${list.filter((b) => b.isPublished).length} published · ${list.filter((b) => !b.isPublished).length} drafts`}
        right={<HeaderAction label="New post" icon={<Plus size={20} color={colors.onAccent} />} onPress={() => router.push({ pathname: '/admin/journal/[id]', params: { id: 'new' } })} />}
      />
      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <View style={{ padding: GUTTER }}>
          <Skeleton style={{ height: 120 }} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(b) => b._id}
          contentContainerStyle={{ padding: GUTTER, gap: 10, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
          ListEmptyComponent={<Empty icon={<BookOpen size={28} color={colors.accentDeep} strokeWidth={1.4} />} title="No posts yet" action="Write the first one" onAction={() => router.push({ pathname: '/admin/journal/[id]', params: { id: 'new' } })} />}
          renderItem={({ item: b }) => (
            <Tap onPress={() => router.push({ pathname: '/admin/journal/[id]', params: { id: b._id } })} style={st.row}>
              <View style={st.thumb}>{!!b.coverImage && <Image source={{ uri: img(b.coverImage) }} style={StyleSheet.absoluteFill} contentFit="cover" />}</View>
              <View style={{ flex: 1 }}>
                <T v="title" numberOfLines={2} style={{ fontSize: 14 }}>
                  {b.title}
                </T>
                <T v="caption" style={{ marginTop: 2 }}>
                  {b.category} · {fmtDateTime(b.createdAt)}
                </T>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                  <Pill tone={b.isPublished ? 'success' : 'warning'}>{b.isPublished ? 'Published' : 'Draft'}</Pill>
                  {b.isFeatured && <Pill>Featured</Pill>}
                </View>
              </View>
            </Tap>
          )}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  thumb: { width: 72, height: 72, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.sand },
});
