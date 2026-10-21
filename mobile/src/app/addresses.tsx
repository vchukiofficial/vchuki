import { MapPin, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressForm } from '@/components/AddressForm';
import { Sheet } from '@/components/Sheet';
import { Button, Empty, ErrorState, Header, Pill, Skeleton, T, Tap } from '@/components/ui';
import { api } from '@/lib/api';
import type { Address } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useBackToHome } from '@/lib/useSystemBack';
import { colors, fonts, GUTTER, radius } from '@/theme';

export default function Addresses() {
  useBackToHome();
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload, setData } = useFetch<{ addresses: Address[] }>('/api/users/me/addresses');
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const list = data?.addresses || [];

  async function mutate(p: Promise<{ addresses: Address[] }>) {
    try {
      setData(await p);
    } catch (e: any) {
      Alert.alert('Something went wrong', e.message);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Saved addresses"
        right={
          <Tap onPress={() => setAdding(true)} hitSlop={10} accessibilityLabel="Add address" style={{ padding: 8 }}>
            <Plus size={21} color={colors.ink} />
          </Tap>
        }
      />
      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <View style={{ padding: GUTTER, gap: 12 }}>
          <Skeleton style={{ height: 100 }} />
          <Skeleton style={{ height: 100 }} />
        </View>
      ) : list.length === 0 ? (
        <Empty icon={<MapPin size={30} color={colors.accentDeep} strokeWidth={1.4} />} title="No saved addresses" body="Add one now for one-tap checkout." action="Add address" onAction={() => setAdding(true)} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: GUTTER, gap: 12, paddingBottom: insets.bottom + 30 }}>
          {list.map((a) => (
            <View key={a._id} style={[st.card, a.isDefault && { borderColor: colors.ink }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <T v="title" style={{ flex: 1 }}>
                  {a.name}
                </T>
                {a.isDefault && <Pill tone="dark">Default</Pill>}
              </View>
              <T v="small" style={{ marginTop: 4 }}>
                {a.street}, {a.city}, {a.state} {a.zip}
              </T>
              <T v="caption" style={{ marginTop: 2 }}>
                +91 {a.phone}
              </T>
              <View style={{ flexDirection: 'row', gap: 20, marginTop: 14 }}>
                {!a.isDefault && (
                  <Tap onPress={() => mutate(api('/api/users/me/addresses', { method: 'PATCH', body: { addressId: a._id } }))} hitSlop={8}>
                    <T v="caption" style={{ color: colors.ink, fontFamily: fonts.semibold }}>
                      Make default
                    </T>
                  </Tap>
                )}
                <Tap
                  hitSlop={8}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                  onPress={() =>
                    Alert.alert('Delete this address?', `${a.street}, ${a.city}`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => mutate(api(`/api/users/me/addresses?addressId=${a._id}`, { method: 'DELETE' })) },
                    ])
                  }>
                  <Trash2 size={13} color={colors.danger} />
                  <T v="caption" style={{ color: colors.danger, fontFamily: fonts.semibold }}>
                    Delete
                  </T>
                </Tap>
              </View>
            </View>
          ))}
          <Button title="Add a new address" kind="outline" onPress={() => setAdding(true)} style={{ marginTop: 8 }} />
        </ScrollView>
      )}

      <Sheet open={adding} onClose={() => setAdding(false)} title="New address">
        <AddressForm
          busy={busy}
          onSubmit={async (a) => {
            setBusy(true);
            await mutate(api('/api/users/me/addresses', { method: 'POST', body: a }));
            setBusy(false);
            setAdding(false);
          }}
        />
        <View style={{ height: 12 }} />
      </Sheet>
    </View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line },
});
