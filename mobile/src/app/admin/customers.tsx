import { Mail, MessageCircle, Phone, ShieldCheck, Trash2, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Linking, RefreshControl, StyleSheet, View } from 'react-native';
import { confirm, fmtDateTime, inr, SearchBar, Segments, StudioHeader } from '@/components/admin';
import { Sheet } from '@/components/Sheet';
import { Button, Empty, ErrorState, Pill, Row, Skeleton, T, Tap } from '@/components/ui';
import { api } from '@/lib/api';
import type { Address, Order } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useAuth } from '@/store/auth';
import { colors, fonts, GUTTER, radius } from '@/theme';

interface Customer { _id: string; name: string; email: string; role: 'user' | 'admin'; addresses: Address[]; wishlist: string[]; createdAt: string }

export default function Customers() {
  const me = useAuth((s) => s.user);
  const { data, loading, error, reload, refresh, refreshing, setData } = useFetch<{ users: Customer[] }>('/api/users');
  const orders = useFetch<{ orders: (Order & { user?: { _id: string } | string })[] }>('/api/orders');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'buyers' | 'admins'>('all');
  const [open, setOpen] = useState<Customer | null>(null);
  const list = data?.users || [];

  // Orders per customer, from the full order list
  const byUser = useMemo(() => {
    const m = new Map<string, { count: number; spent: number; last?: string }>();
    for (const o of orders.data?.orders || []) {
      const uid = typeof o.user === 'object' && o.user ? o.user._id : (o.user as string | undefined);
      if (!uid) continue;
      const cur = m.get(uid) || { count: 0, spent: 0 };
      cur.count += 1;
      if (!['cancelled', 'returned'].includes(o.shippingStatus)) cur.spent += o.finalAmount || 0;
      if (!cur.last || o.createdAt > cur.last) cur.last = o.createdAt;
      m.set(uid, cur);
    }
    return m;
  }, [orders.data]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return list.filter((u) => {
      if (t && !`${u.name} ${u.email} ${u.addresses?.[0]?.phone || ''}`.toLowerCase().includes(t)) return false;
      if (filter === 'admins') return u.role === 'admin';
      if (filter === 'buyers') return (byUser.get(u._id)?.count || 0) > 0;
      return true;
    });
  }, [list, q, filter, byUser]);

  async function setRole(u: Customer, role: 'user' | 'admin') {
    try {
      await api(`/api/users/${u._id}`, { method: 'PATCH', body: { role } });
      setData({ users: list.map((x) => (x._id === u._id ? { ...x, role } : x)) });
      setOpen({ ...u, role });
    } catch (e: any) {
      Alert.alert('Not saved', e.message);
    }
  }

  const stats = open ? byUser.get(open._id) : undefined;
  const phone = open?.addresses?.find((a) => a.isDefault)?.phone || open?.addresses?.[0]?.phone;

  return (
    <View style={{ flex: 1 }}>
      <StudioHeader title="Customers" subtitle={`${list.length} accounts · ${[...byUser.values()].filter((v) => v.count > 1).length} repeat buyers`} />
      <SearchBar value={q} onChange={setQ} placeholder="Name, email or phone" />
      <View>
        <Segments
          items={[
            { key: 'all', label: 'All', count: list.length },
            { key: 'buyers', label: 'Have ordered' },
            { key: 'admins', label: 'Admins', count: list.filter((u) => u.role === 'admin').length },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </View>
      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <View style={{ paddingHorizontal: GUTTER, gap: 8 }}>
          {[0, 1, 2, 3].map((k) => (
            <Skeleton key={k} style={{ height: 62 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(u) => u._id}
          contentContainerStyle={{ paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
          ListEmptyComponent={<Empty icon={<Users size={28} color={colors.accentDeep} strokeWidth={1.4} />} title="No customers match" />}
          renderItem={({ item: u }) => {
            const s = byUser.get(u._id);
            return (
              <Tap onPress={() => setOpen(u)} style={st.row}>
                <View style={st.avatar}>
                  <T style={{ fontFamily: fonts.display, color: colors.nightText, fontSize: 17 }}>{u.name?.[0]?.toUpperCase() || '?'}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T v="title" style={{ fontSize: 14 }} numberOfLines={1}>
                    {u.name}
                  </T>
                  <T v="caption" numberOfLines={1}>
                    {u.email}
                  </T>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  {u.role === 'admin' && <Pill tone="dark">Admin</Pill>}
                  {!!s && (
                    <T v="caption" style={{ color: colors.ink, fontFamily: fonts.semibold }}>
                      {s.count} {s.count === 1 ? 'order' : 'orders'}
                    </T>
                  )}
                </View>
              </Tap>
            );
          }}
        />
      )}

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.name || ''}>
        {open && (
          <>
            <T v="small">{open.email}</T>
            <T v="caption" style={{ marginTop: 2 }}>
              Joined {fmtDateTime(open.createdAt)}
            </T>
            <View style={st.box}>
              <Row label="Orders" value={String(stats?.count || 0)} />
              <Row label="Lifetime spend" value={inr(stats?.spent || 0)} />
              <Row label="Last order" value={stats?.last ? fmtDateTime(stats.last) : '—'} />
              <Row label="Wishlist" value={`${open.wishlist?.length || 0} items`} />
              <Row label="Saved addresses" value={String(open.addresses?.length || 0)} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Button title="Email" kind="outline" compact icon={<Mail size={15} color={colors.ink} />} onPress={() => Linking.openURL(`mailto:${open.email}`)} style={{ flex: 1 }} />
              {!!phone && (
                <>
                  <Button title="Call" kind="outline" compact icon={<Phone size={15} color={colors.ink} />} onPress={() => Linking.openURL(`tel:+91${phone}`)} style={{ flex: 1 }} />
                  <Button title="WA" kind="outline" compact icon={<MessageCircle size={15} color={colors.success} />} onPress={() => Linking.openURL(`https://wa.me/91${phone}`)} style={{ flex: 1 }} />
                </>
              )}
            </View>
            {open._id !== me?._id && (
              <>
                <Button
                  title={open.role === 'admin' ? 'Remove admin access' : 'Make admin (full Studio access)'}
                  kind={open.role === 'admin' ? 'outline' : 'primary'}
                  icon={<ShieldCheck size={16} color={open.role === 'admin' ? colors.ink : colors.nightText} />}
                  onPress={() =>
                    confirm(
                      open.role === 'admin' ? 'Remove admin?' : 'Make admin?',
                      open.role === 'admin' ? `${open.name} loses access to Studio.` : `${open.name} will see revenue, every customer and can edit everything.`,
                      'Confirm',
                      () => setRole(open, open.role === 'admin' ? 'user' : 'admin'),
                      open.role === 'admin',
                    )
                  }
                  style={{ marginTop: 16 }}
                />
                <Tap
                  onPress={() =>
                    confirm('Delete account?', 'Their orders stay, but the login, wishlist and addresses are removed.', 'Delete', async () => {
                      try {
                        await api(`/api/users/${open._id}`, { method: 'DELETE' });
                        setData({ users: list.filter((x) => x._id !== open._id) });
                        setOpen(null);
                      } catch (e: any) {
                        Alert.alert('Not deleted', e.message);
                      }
                    })
                  }
                  style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 14 }}>
                  <Trash2 size={14} color={colors.danger} />
                  <T v="caption" style={{ color: colors.danger, fontFamily: fonts.semibold }}>
                    Delete account
                  </T>
                </Tap>
              </>
            )}
          </>
        )}
      </Sheet>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: GUTTER, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.night, alignItems: 'center', justifyContent: 'center' },
  box: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, marginVertical: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
