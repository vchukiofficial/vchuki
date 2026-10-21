import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ImagePlus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { confirm, SectionLabel, StudioHeader, ToggleRow } from '@/components/admin';
import { Button, Card, Field, T, Tap } from '@/components/ui';
import { api, img } from '@/lib/api';
import { htmlToText, textToHtml } from '@/lib/postFormat';
import { pickAndUpload } from '@/lib/upload';
import { colors, fonts, GUTTER, radius } from '@/theme';
import type { AdminBlog } from './index';

const EMPTY: Partial<AdminBlog> = { title: '', excerpt: '', content: '', coverImage: '', category: 'Style', tags: [], readTime: '4 min', isPublished: false, isFeatured: false };

/**
 * Journal editor. Write in plain text: blank line = new paragraph, "## " = heading, "- " = bullet.
 * Converted to/from the HTML the website renders (src/lib/postFormat.ts).
 */
export default function EditPost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const insets = useSafeAreaInsets();
  const [b, setB] = useState<Partial<AdminBlog>>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = <K extends keyof AdminBlog>(k: K, v: AdminBlog[K]) => setB((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    if (isNew) return;
    api<AdminBlog>(`/api/admin/blogs/${id}`)
      .then((post) => setB({ ...post, content: htmlToText(post.content || '') }))
      .catch((e) => Alert.alert('Couldn’t load', e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function save(publish?: boolean) {
    if (!b.title?.trim() || !b.excerpt?.trim() || !b.content?.trim()) return Alert.alert('Title, summary and the post itself are required');
    setBusy(true);
    const words = (b.content || '').split(/\s+/).length;
    const body = { ...b, content: textToHtml(b.content || ''), title: b.title.trim(), excerpt: b.excerpt.trim(), readTime: `${Math.max(1, Math.round(words / 200))} min`, isPublished: publish ?? b.isPublished };
    try {
      if (isNew) await api('/api/admin/blogs', { method: 'POST', body });
      else await api(`/api/admin/blogs/${id}`, { method: 'PUT', body });
      router.back();
    } catch (e: any) {
      Alert.alert('Not saved', /E11000|duplicate/i.test(e.message) ? 'A post with this title/slug already exists.' : e.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <StudioHeader title="Post" />
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StudioHeader title={isNew ? 'New post' : 'Edit post'} subtitle={b.isPublished ? 'Published — changes go live on save' : 'Draft — only admins can see it'} />
      <ScrollView contentContainerStyle={{ padding: GUTTER, paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
        <Tap
          onPress={async () => {
            setUploading(true);
            try {
              const [u] = await pickAndUpload();
              if (u) set('coverImage', u);
            } catch (e: any) {
              Alert.alert('Upload failed', e.message);
            } finally {
              setUploading(false);
            }
          }}
          style={st.cover}>
          {b.coverImage ? <Image source={{ uri: img(b.coverImage) }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
          <View style={st.coverBtn}>
            {uploading ? <ActivityIndicator color={colors.white} /> : <ImagePlus size={18} color={colors.white} />}
            <T v="caption" style={{ color: colors.white, fontFamily: fonts.semibold }}>
              {b.coverImage ? 'Change cover' : 'Add cover photo'}
            </T>
          </View>
        </Tap>

        <Field label="Title" value={b.title} onChangeText={(v) => set('title', v)} />
        <Field label="Summary (shown on cards & Google)" value={b.excerpt} onChangeText={(v) => set('excerpt', v)} multiline style={{ height: 70, paddingTop: 14, textAlignVertical: 'top' }} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Category" value={b.category} onChangeText={(v) => set('category', v)} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Tags" value={(b.tags || []).join(', ')} onChangeText={(v) => set('tags', v.split(',').map((t) => t.trim()).filter(Boolean))} autoCapitalize="none" />
          </View>
        </View>
        <Field
          label="Post"
          value={b.content}
          onChangeText={(v) => set('content', v)}
          multiline
          style={{ minHeight: 280, paddingTop: 14, textAlignVertical: 'top', lineHeight: 22 }}
          placeholder={'Blank line = new paragraph\n## Heading\n- bullet point'}
        />
        <Card style={{ paddingVertical: 2 }}>
          <ToggleRow label="Featured" hint="Pinned at the top of the journal" value={!!b.isFeatured} onChange={(v) => set('isFeatured', v)} />
        </Card>

        {!isNew && (
          <>
            <SectionLabel>Danger zone</SectionLabel>
            <Tap
              onPress={() =>
                confirm('Delete post?', 'It disappears from the website and app.', 'Delete', async () => {
                  await api(`/api/admin/blogs/${id}`, { method: 'DELETE' }).catch((e) => Alert.alert('Failed', e.message));
                  router.back();
                })
              }
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 }}>
              <Trash2 size={15} color={colors.danger} />
              <T v="caption" style={{ color: colors.danger, fontFamily: fonts.semibold }}>
                Delete post
              </T>
            </Tap>
          </>
        )}
      </ScrollView>
      <View style={[st.bar, { paddingBottom: insets.bottom + 10 }]}>
        {b.isPublished ? (
          <>
            <Button title="Unpublish" kind="outline" onPress={() => save(false)} loading={busy} style={{ flex: 1 }} />
            <Button title="Save" onPress={() => save()} loading={busy} style={{ flex: 1 }} />
          </>
        ) : (
          <>
            <Button title="Save draft" kind="outline" onPress={() => save(false)} loading={busy} style={{ flex: 1 }} />
            <Button title="Publish" kind="accent" onPress={() => save(true)} loading={busy} style={{ flex: 1 }} />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  cover: { height: 180, borderRadius: radius.lg, backgroundColor: colors.night, overflow: 'hidden', marginBottom: 16, alignItems: 'center', justifyContent: 'center' },
  coverBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: GUTTER, paddingTop: 12, backgroundColor: colors.bar, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
