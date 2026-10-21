import { Plus, Tag } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Switch, View } from 'react-native';
import { confirm, HeaderAction, inr, StudioHeader } from '@/components/admin';
import { Sheet } from '@/components/Sheet';
import { Button, Chip, Empty, ErrorState, Field, Pill, Skeleton, T, Tap } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { colors, fonts, GUTTER, radius } from '@/theme';

interface Coupon { _id: string; code: string; type: string; value: number; maxValue?: number; minAmount?: number; validFrom: string; validTo: string; usageLimit: number; usedBy: string[]; isActive: boolean }

// Only these three are actually applied by /api/coupons/validate today
const TYPES = [
  { key: 'percentage', label: '% off' },
  { key: 'flat', label: '₹ off' },
  { key: 'first_order', label: 'First order %' },
];

const describe = (c: Coupon) =>
  c.type === 'flat' ? `${inr(c.value)} off` : `${c.value}% off${c.maxValue ? ` (max ${inr(c.maxValue)})` : ''}${c.type === 'first_order' ? ' · first order' : ''}`;

export default function Coupons() {
  const { data, loading, error, reload, refresh, refreshing, setData } = useFetch<{ coupons: Coupon[] }>('/api/coupons');
  const [open, setOpen] = useState(false);
  const list = data?.coupons || [];

  async function toggle(c: Coupon) {
    setData({ coupons: list.map((x) => (x._id === c._id ? { ...x, isActive: !c.isActive } : x)) });
    try {
      await api(`/api/coupons/${c._id}`, { method: 'PATCH', body: { isActive: !c.isActive } });
    } catch (e: any) {
      Alert.alert('Not saved', e.message);
      reload();
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader title="Coupons" subtitle={`${list.filter((c) => c.isActive).length} active codes`} right={<HeaderAction label="New coupon" icon={<Plus size={20} color={colors.onAccent} />} onPress={() => setOpen(true)} />} />
      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <View style={{ padding: GUTTER, gap: 10 }}>
          <Skeleton style={{ height: 90 }} />
          <Skeleton style={{ height: 90 }} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(c) => c._id}
          contentContainerStyle={{ padding: GUTTER, gap: 10, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
          ListEmptyComponent={<Empty icon={<Tag size={28} color={colors.accentDeep} strokeWidth={1.4} />} title="No coupons yet" action="Create a coupon" onAction={() => setOpen(true)} />}
          renderItem={({ item: c }) => {
            const expired = new Date(c.validTo) < new Date();
            const used = c.usedBy?.length || 0;
            return (
              <Tap
                onLongPress={() =>
                  confirm(`Delete ${c.code}?`, 'Customers will no longer be able to use it.', 'Delete', async () => {
                    try {
                      await api(`/api/coupons/${c._id}`, { method: 'DELETE' });
                      setData({ coupons: list.filter((x) => x._id !== c._id) });
                    } catch (e: any) {
                      Alert.alert('Not deleted', e.message);
                    }
                  })
                }
                style={[st.card, (!c.isActive || expired) && { opacity: 0.6 }]}>
                <View style={st.ticket}>
                  <T style={{ fontFamily: fonts.bold, fontSize: 16, letterSpacing: 1.5, color: colors.nightText }}>{c.code}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T v="title" style={{ fontSize: 14 }}>
                    {describe(c)}
                  </T>
                  <T v="caption">
                    {c.minAmount ? `Min ${inr(c.minAmount)} · ` : ''}
                    {used}/{c.usageLimit} used · till {new Date(c.validTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </T>
                  {expired && (
                    <View style={{ marginTop: 6 }}>
                      <Pill tone="danger">Expired</Pill>
                    </View>
                  )}
                </View>
                <Switch value={c.isActive} onValueChange={() => toggle(c)} trackColor={{ true: colors.success, false: colors.line }} thumbColor={colors.white} />
              </Tap>
            );
          }}
          ListFooterComponent={list.length ? <T v="caption" style={{ textAlign: 'center', marginTop: 10 }}>Long-press a coupon to delete it.</T> : undefined}
        />
      )}
      <NewCoupon open={open} onClose={() => setOpen(false)} onCreated={(c) => setData({ coupons: [c, ...list] })} />
    </View>
  );
}

function NewCoupon({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (c: Coupon) => void }) {
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('10');
  const [max, setMax] = useState('');
  const [min, setMin] = useState('');
  const [limit, setLimit] = useState('100');
  const [days, setDays] = useState('30');
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!/^[A-Z0-9]{3,20}$/.test(code)) return Alert.alert('Check the code', '3–20 letters or numbers, no spaces.');
    setBusy(true);
    try {
      const c = await api<Coupon>('/api/coupons', {
        method: 'POST',
        body: {
          code,
          type,
          value: Number(value) || 0,
          maxValue: max ? Number(max) : undefined,
          minAmount: min ? Number(min) : undefined,
          usageLimit: Number(limit) || 1,
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + (Number(days) || 30) * 86400000).toISOString(),
          isActive: true,
        },
      });
      onCreated(c);
      onClose();
      setCode('');
    } catch (e: any) {
      Alert.alert('Not created', /E11000|duplicate/i.test(e.message) ? 'That code already exists.' : e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="New coupon">
      <Field label="Code" value={code} onChangeText={(v) => setCode(v.toUpperCase().replace(/[^A-Z0-9]/g, ''))} autoCapitalize="characters" placeholder="DIWALI15" />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {TYPES.map((t) => (
          <Chip key={t.key} label={t.label} active={type === t.key} onPress={() => setType(t.key)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label={type === 'flat' ? 'Amount ₹' : 'Percent %'} value={value} onChangeText={(v) => setValue(v.replace(/\D/g, ''))} keyboardType="number-pad" />
        </View>
        {type !== 'flat' && (
          <View style={{ flex: 1 }}>
            <Field label="Max discount ₹" value={max} onChangeText={(v) => setMax(v.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="No cap" />
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="Min order ₹" value={min} onChangeText={(v) => setMin(v.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="None" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Total uses" value={limit} onChangeText={(v) => setLimit(v.replace(/\D/g, ''))} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Valid days" value={days} onChangeText={(v) => setDays(v.replace(/\D/g, ''))} keyboardType="number-pad" />
        </View>
      </View>
      <Button title="Create coupon" onPress={create} loading={busy} />
      <View style={{ height: 12 }} />
    </Sheet>
  );
}

const st = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  ticket: { backgroundColor: colors.night, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, borderLeftWidth: 4, borderLeftColor: colors.accent },
});
