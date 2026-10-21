import { useVideoPlayer, VideoView } from 'expo-video';
import { ArrowDown, ArrowUp, Link2, Plus, Trash2, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Switch, View } from 'react-native';
import { confirm, HeaderAction, StudioHeader } from '@/components/admin';
import { Sheet } from '@/components/Sheet';
import { Button, Empty, ErrorState, Field, Skeleton, T, Tap } from '@/components/ui';
import { api, img } from '@/lib/api';
import { pickAndUpload } from '@/lib/upload';
import { useFetch } from '@/lib/useFetch';
import { colors, GUTTER, radius } from '@/theme';

interface Video { _id: string; title: string; url: string; isActive: boolean; order: number }

export default function HeroVideos() {
  const { data, loading, error, reload, setData } = useFetch<{ videos: Video[] }>('/api/admin/hero-videos');
  const [open, setOpen] = useState(false);
  const list = data?.videos || [];

  async function update(v: Video, body: Partial<Video>) {
    setData({ videos: list.map((x) => (x._id === v._id ? { ...x, ...body } : x)) });
    try {
      await api('/api/admin/hero-videos', { method: 'PUT', body: { id: v._id, ...body } });
    } catch (e: any) {
      Alert.alert('Not saved', e.message);
      reload();
    }
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const a = list[i];
    const b = list[j];
    const next = [...list];
    next[i] = b;
    next[j] = a;
    setData({ videos: next });
    await Promise.all([api('/api/admin/hero-videos', { method: 'PUT', body: { id: a._id, order: j } }), api('/api/admin/hero-videos', { method: 'PUT', body: { id: b._id, order: i } })]).catch((e) => Alert.alert('Not saved', e.message));
  }

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader title="Hero videos" subtitle="The first active video plays on the home page" right={<HeaderAction label="Add video" icon={<Plus size={20} color={colors.onAccent} />} onPress={() => setOpen(true)} />} />
      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <View style={{ padding: GUTTER }}>
          <Skeleton style={{ height: 220 }} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(v) => v._id}
          contentContainerStyle={{ padding: GUTTER, gap: 14, paddingBottom: 60 }}
          ListEmptyComponent={<Empty icon={<Upload size={28} color={colors.accentDeep} strokeWidth={1.4} />} title="No videos" body="The home page shows a product photo until you add one." />}
          renderItem={({ item: v, index }) => (
            <View style={[st.card, !v.isActive && { opacity: 0.6 }]}>
              <Preview url={v.url} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <T v="title" style={{ fontSize: 14 }} numberOfLines={1}>
                    {v.title}
                  </T>
                  <T v="caption">{index === 0 && v.isActive ? 'Playing on home page' : v.isActive ? 'Active' : 'Off'}</T>
                </View>
                <Tap onPress={() => move(index, -1)} hitSlop={6} style={st.icon} disabled={index === 0}>
                  <ArrowUp size={16} color={index === 0 ? colors.faint : colors.ink} />
                </Tap>
                <Tap onPress={() => move(index, 1)} hitSlop={6} style={st.icon} disabled={index === list.length - 1}>
                  <ArrowDown size={16} color={index === list.length - 1 ? colors.faint : colors.ink} />
                </Tap>
                <Tap
                  onPress={() =>
                    confirm('Delete video?', v.title, 'Delete', async () => {
                      await api(`/api/admin/hero-videos?id=${v._id}`, { method: 'DELETE' }).catch((e) => Alert.alert('Failed', e.message));
                      setData({ videos: list.filter((x) => x._id !== v._id) });
                    })
                  }
                  style={st.icon}>
                  <Trash2 size={16} color={colors.danger} />
                </Tap>
                <Switch value={v.isActive} onValueChange={(on) => update(v, { isActive: on })} trackColor={{ true: colors.success, false: colors.line }} thumbColor={colors.white} />
              </View>
            </View>
          )}
        />
      )}
      <AddVideo open={open} count={list.length} onClose={() => setOpen(false)} onAdded={(v) => setData({ videos: [...list, v] })} />
    </View>
  );
}

function Preview({ url }: { url: string }) {
  const player = useVideoPlayer(img(url) || null, (p) => {
    p.loop = true;
    p.muted = true;
  });
  return <VideoView player={player} style={st.video} contentFit="cover" nativeControls />;
}

function AddVideo({ open, count, onClose, onAdded }: { open: boolean; count: number; onClose: () => void; onAdded: (v: Video) => void }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);

  async function upload() {
    setBusy(true);
    try {
      const [u] = await pickAndUpload({ video: true });
      if (u) setUrl(u);
    } catch (e: any) {
      Alert.alert('Upload failed', `${e.message}\n\nVercel limits uploads to about 4.5 MB through the API. For larger films, upload to Vercel Blob from the website and paste the link.`);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!title.trim() || !url.trim()) return Alert.alert('Add a title and a video');
    setBusy(true);
    try {
      const r = await api<{ video: Video }>('/api/admin/hero-videos', { method: 'POST', body: { title: title.trim(), url: url.trim(), isActive: true, order: count } });
      onAdded(r.video);
      onClose();
      setTitle('');
      setUrl('');
    } catch (e: any) {
      Alert.alert('Not saved', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add hero video">
      <Field label="Title" value={title} onChangeText={setTitle} placeholder="Quiet luxury GRWM" />
      <Button title={url ? 'Video ready ✓ — pick another' : 'Upload from phone'} kind="outline" icon={<Upload size={16} color={colors.ink} />} onPress={upload} loading={busy && !url} />
      <T v="caption" style={{ textAlign: 'center', marginVertical: 10 }}>
        or paste a link
      </T>
      <Field label="Video URL (.mp4)" value={url} onChangeText={setUrl} autoCapitalize="none" right={<Link2 size={16} color={colors.muted} />} />
      <Button title="Add video" onPress={save} loading={busy && !!url} disabled={!url || !title.trim()} />
      <View style={{ height: 12 }} />
    </Sheet>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  video: { width: '100%', height: 200, borderRadius: radius.md, backgroundColor: colors.night, overflow: 'hidden' },
  icon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});
