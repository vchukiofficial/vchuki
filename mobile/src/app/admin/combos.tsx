import { Plus, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Switch, View } from 'react-native';
import { confirm, HeaderAction, StudioHeader } from '@/components/admin';
import { Sheet } from '@/components/Sheet';
import { Button, Chip, Empty, ErrorState, Field, Pill, Skeleton, T, Tap } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { colors, fonts, GUTTER, radius } from '@/theme';

interface Combo { _id: string; title: string; description: string; discount: number; categories: string[]; sizeGroup: string; minQty: number; isActive: boolean; validTo: string }

const CATS = [
  { key: 'full-sleeve-shirt', label: 'Full sleeve shirt' },
  { key: 'half-sleeve-shirt', label: 'Half sleeve shirt' },
  { key: 'full-sleeve-kurta', label: 'Kurta' },
];

export default function Combos() {
  const { data, loading, error, reload, setData } = useFetch<{ offers: Combo[] }>('/api/combo-offers');
  const [open, setOpen] = useState(false);
  const list = data?.offers || [];

  async function toggle(c: Combo) {
    setData({ offers: list.map((x) => (x._id === c._id ? { ...x, isActive: !c.isActive } : x)) });
    try {
      await api(`/api/combo-offers/${c._id}`, { method: 'PUT', body: { isActive: !c.isActive } });
    } catch (e: any) {
      Alert.alert('Not saved', e.message);
      reload();
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader title="Bundles" subtitle="Shown on the home page as Bundle & save" right={<HeaderAction label="New bundle" icon={<Plus size={20} color={colors.onAccent} />} onPress={() => setOpen(true)} />} />
      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <View style={{ padding: GUTTER }}>
          <Skeleton style={{ height: 100 }} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(c) => c._id}
          contentContainerStyle={{ padding: GUTTER, gap: 10, paddingBottom: 60 }}
          ListHeaderComponent={
            <T v="caption" style={{ marginBottom: 6 }}>
              Note: the bag currently applies the built-in 3-pack and shirt + kurta discounts (same as the website). Bundles here control what’s advertised.
            </T>
          }
          ListEmptyComponent={<Empty icon={<Sparkles size={28} color={colors.accentDeep} strokeWidth={1.4} />} title="No bundles yet" />}
          renderItem={({ item: c }) => {
            const expired = new Date(c.validTo) < new Date();
            return (
              <Tap
                onLongPress={() =>
                  confirm(`Delete “${c.title}”?`, '', 'Delete', async () => {
                    await api(`/api/combo-offers/${c._id}`, { method: 'DELETE' }).catch((e) => Alert.alert('Not deleted', e.message));
                    setData({ offers: list.filter((x) => x._id !== c._id) });
                  })
                }
                style={st.card}>
                <T style={{ fontFamily: fonts.display, fontSize: 30, color: colors.accent, width: 64 }}>{c.discount}%</T>
                <View style={{ flex: 1 }}>
                  <T v="title" style={{ color: colors.nightText, fontSize: 14 }}>
                    {c.title}
                  </T>
                  <T v="caption" style={{ color: 'rgba(245,230,211,0.65)' }} numberOfLines={2}>
                    {c.description}
                  </T>
                  <T v="caption" style={{ color: 'rgba(245,230,211,0.5)', marginTop: 4 }}>
                    Min {c.minQty} · {c.sizeGroup} · till {new Date(c.validTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </T>
                  {expired && (
                    <View style={{ marginTop: 6 }}>
                      <Pill tone="danger">Expired</Pill>
                    </View>
                  )}
                </View>
                <Switch value={c.isActive} onValueChange={() => toggle(c)} trackColor={{ true: colors.accent, false: '#4A3F35' }} thumbColor={colors.white} />
              </Tap>
            );
          }}
        />
      )}
      <NewCombo open={open} onClose={() => setOpen(false)} onCreated={(c) => setData({ offers: [c, ...list] })} />
    </View>
  );
}

function NewCombo({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (c: Combo) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('15');
  const [cats, setCats] = useState<string[]>(['full-sleeve-shirt']);
  const [sizeGroup, setSizeGroup] = useState('all');
  const [minQty, setMinQty] = useState('3');
  const [days, setDays] = useState('30');
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!title.trim() || !cats.length) return Alert.alert('Add a title and at least one category');
    setBusy(true);
    try {
      const c = await api<Combo>('/api/combo-offers', {
        method: 'POST',
        body: { title: title.trim(), description: description.trim(), discount: Number(discount) || 0, categories: cats, sizeGroup, minQty: Number(minQty) || 2, isActive: true, validTo: new Date(Date.now() + (Number(days) || 30) * 86400000).toISOString() },
      });
      onCreated(c);
      onClose();
      setTitle('');
      setDescription('');
    } catch (e: any) {
      Alert.alert('Not created', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="New bundle">
      <Field label="Title" value={title} onChangeText={setTitle} placeholder="3× Full Sleeve Shirts" />
      <Field label="Description" value={description} onChangeText={setDescription} placeholder="Buy any 3 & save 15%" />
      <T v="caption" style={{ marginBottom: 8, color: colors.inkSoft }}>
        Applies to
      </T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {CATS.map((c) => (
          <Chip key={c.key} label={c.label} active={cats.includes(c.key)} onPress={() => setCats((x) => (x.includes(c.key) ? x.filter((y) => y !== c.key) : [...x, c.key]))} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {['all', 'S/M/L', 'XL/XXL'].map((g) => (
          <Chip key={g} label={g === 'all' ? 'All sizes' : g} active={sizeGroup === g} onPress={() => setSizeGroup(g)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="Discount %" value={discount} onChangeText={(v) => setDiscount(v.replace(/\D/g, ''))} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Min pieces" value={minQty} onChangeText={(v) => setMinQty(v.replace(/\D/g, ''))} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Valid days" value={days} onChangeText={(v) => setDays(v.replace(/\D/g, ''))} keyboardType="number-pad" />
        </View>
      </View>
      <Button title="Create bundle" onPress={create} loading={busy} />
      <View style={{ height: 12 }} />
    </Sheet>
  );
}

const st = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.night, borderRadius: radius.lg, padding: 16 },
});
