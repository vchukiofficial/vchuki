import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Copy, MapPin, RotateCcw, Smartphone, Truck } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Linking, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet } from '@/components/Sheet';
import { Button, Card, Chip, Divider, ErrorState, Header, Pill, Row, Skeleton, T, Tap } from '@/components/ui';
import { api, img } from '@/lib/api';
import { fmtDate, returnWindowOpen, STATUS_LABEL, STATUS_TONE, TRACK, trackIndex } from '@/lib/orderStatus';
import { rupee } from '@/lib/pricing';
import type { Order } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useBackToHome } from '@/lib/useSystemBack';
import { colors, fonts, GUTTER, radius, space } from '@/theme';

const REASONS = ['Size doesn’t fit', 'Colour different from photos', 'Quality not as expected', 'Received wrong item', 'Damaged in transit', 'Changed my mind'];

export default function OrderDetail() {
  useBackToHome();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data, error, loading, reload } = useFetch<{ order: Order; ref: string; upiLink: string | null }>(id ? `/api/mobile/orders/${id}` : null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  if (error && !data) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Order" />
        <ErrorState message={error} onRetry={reload} />
      </View>
    );
  }
  if (loading || !data) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Order" />
        <View style={{ padding: GUTTER, gap: 14 }}>
          <Skeleton style={{ height: 120 }} />
          <Skeleton style={{ height: 200 }} />
        </View>
      </View>
    );
  }

  const o = data.order;
  const step = trackIndex(o.shippingStatus);
  const cancelled = o.shippingStatus === 'cancelled';
  const canReturn = returnWindowOpen(o) && !o.returnRequest;

  async function submitReturn() {
    if (!reason) return;
    setSending(true);
    try {
      const r = await api<{ message: string }>('/api/orders/return', {
        method: 'POST',
        body: { orderId: o._id, reason: note.trim() ? `${reason} — ${note.trim()}` : reason },
      });
      setReturnOpen(false);
      Alert.alert('Return requested', r.message);
      reload();
    } catch (e: any) {
      Alert.alert('Couldn’t request return', e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Header title={`Order #${data.ref}`} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: insets.bottom + 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <T v="caption">Placed {fmtDate(o.createdAt)}</T>
          <Pill tone={STATUS_TONE[o.shippingStatus]}>{STATUS_LABEL[o.shippingStatus]}</Pill>
        </View>

        {/* UPI pending */}
        {!!data.upiLink && (
          <Card style={{ marginTop: space.lg, backgroundColor: colors.warningWash, borderColor: colors.warningWash }}>
            <T v="title" style={{ color: colors.warning }}>
              Payment pending
            </T>
            <T v="small" style={{ marginTop: 4, color: colors.inkSoft }}>
              Pay {rupee(o.finalAmount)} with any UPI app to confirm this order.
            </T>
            <Button
              title="Pay with UPI"
              kind="accent"
              compact
              icon={<Smartphone size={16} color={colors.onAccent} />}
              onPress={() => Linking.openURL(data.upiLink!).catch(() => Alert.alert('No UPI app found'))}
              style={{ marginTop: 12, alignSelf: 'flex-start' }}
            />
          </Card>
        )}

        {/* Tracker */}
        {!cancelled && (
          <Card style={{ marginTop: space.lg }}>
            <View style={{ flexDirection: 'row' }}>
              {TRACK.map((s, i) => {
                const done = i <= step;
                return (
                  <View key={s.key} style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                      <View style={[st.bar, { opacity: i === 0 ? 0 : 1 }, i <= step && { backgroundColor: colors.ink }]} />
                      <View style={[st.node, done && { backgroundColor: colors.ink, borderColor: colors.ink }]} />
                      <View style={[st.bar, { opacity: i === TRACK.length - 1 ? 0 : 1 }, i < step && { backgroundColor: colors.ink }]} />
                    </View>
                    <T v="caption" style={{ fontSize: 10, marginTop: 8, textAlign: 'center', color: done ? colors.ink : colors.faint }}>
                      {s.label}
                    </T>
                  </View>
                );
              })}
            </View>
            {!!o.awb && (
              <View style={st.awb}>
                <Truck size={16} color={colors.accentDeep} />
                <View style={{ flex: 1 }}>
                  <T v="caption">{o.courier || 'Courier'} · AWB</T>
                  <T v="title" style={{ fontSize: 14 }}>
                    {o.awb}
                  </T>
                </View>
                <Tap onPress={() => Share.share({ message: o.awb! })} hitSlop={10} accessibilityLabel="Share tracking number">
                  <Copy size={16} color={colors.ink} />
                </Tap>
              </View>
            )}
          </Card>
        )}

        {/* Items */}
        <T v="h3" style={{ marginTop: space.xxl, marginBottom: space.md }}>
          Items
        </T>
        {o.items.map((i, k) => (
          <View key={k} style={st.item}>
            <Image source={{ uri: img(i.image) }} style={st.thumb} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <T v="title" numberOfLines={2} style={{ fontSize: 14 }}>
                {i.name}
              </T>
              <T v="caption" style={{ marginTop: 3 }}>
                {i.size} · {i.color} · Qty {i.quantity}
              </T>
            </View>
            <T v="price" style={{ fontSize: 14 }}>
              {rupee(i.price * i.quantity)}
            </T>
          </View>
        ))}

        <Card style={{ marginTop: space.lg }}>
          <Row label="Subtotal" value={rupee(o.totalAmount)} />
          {o.discountAmount > 0 && <Row label={`Discount${o.couponCode ? ` (${o.couponCode})` : ''}`} value={`−${rupee(o.discountAmount)}`} tone="success" />}
          {!!o.codCharge && <Row label="COD fee" value={rupee(o.codCharge)} />}
          <Divider style={{ marginVertical: 10 }} />
          <Row label="Total" value={rupee(o.finalAmount)} strong />
          <T v="caption" style={{ marginTop: 6 }}>
            {o.paymentMethod === 'cod' ? 'Cash on delivery' : o.paymentMethod.toUpperCase()} · {o.paymentStatus === 'paid' ? 'Paid' : 'Payment pending'}
          </T>
        </Card>

        <Card style={{ marginTop: space.md, flexDirection: 'row', gap: 12 }}>
          <MapPin size={18} color={colors.accentDeep} />
          <View style={{ flex: 1 }}>
            <T v="title" style={{ fontSize: 14 }}>
              {o.shippingAddress.name}
            </T>
            <T v="small" style={{ marginTop: 3 }}>
              {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zip}
            </T>
            <T v="caption" style={{ marginTop: 3 }}>
              +91 {o.shippingAddress.phone}
            </T>
          </View>
        </Card>

        {/* History */}
        <T v="h3" style={{ marginTop: space.xxl, marginBottom: space.md }}>
          History
        </T>
        {[...o.timeline].reverse().map((t, k) => (
          <View key={k} style={{ flexDirection: 'row', gap: 12, paddingBottom: 14 }}>
            <View style={[st.histDot, k === 0 && { backgroundColor: colors.accent }]} />
            <View style={{ flex: 1 }}>
              <T v="small" style={{ color: colors.ink }}>
                {t.event}
              </T>
              <T v="caption">{new Date(t.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</T>
            </View>
          </View>
        ))}

        {o.returnRequest && (
          <Card style={{ marginTop: space.md }}>
            <T v="title">Return {o.returnRequest.status}</T>
            <T v="small" style={{ marginTop: 4 }}>
              {o.returnRequest.reason}
            </T>
            <T v="caption" style={{ marginTop: 4 }}>
              We’ll arrange pickup within 2–3 business days.
            </T>
          </Card>
        )}

        {canReturn && (
          <Button title="Return or exchange" kind="outline" icon={<RotateCcw size={16} color={colors.ink} />} onPress={() => setReturnOpen(true)} style={{ marginTop: space.xl }} />
        )}
        <Button title="Need help with this order?" kind="ghost" compact onPress={() => router.push('/(tabs)/account')} style={{ marginTop: 6 }} />
      </ScrollView>

      <Sheet open={returnOpen} onClose={() => setReturnOpen(false)} title="Request a return">
        <T v="small" style={{ marginBottom: 12 }}>
          Returns are accepted within 7 days of delivery. What went wrong?
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {REASONS.map((r) => (
            <Chip key={r} label={r} active={reason === r} onPress={() => setReason(r)} />
          ))}
        </View>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Anything else we should know? (optional)"
          placeholderTextColor={colors.faint}
          multiline
          style={st.note}
        />
        <Button title="Submit return request" onPress={submitReturn} loading={sending} disabled={!reason} style={{ marginTop: 16 }} />
        <View style={{ height: 12 }} />
      </Sheet>
    </View>
  );
}

const st = StyleSheet.create({
  bar: { flex: 1, height: 2, backgroundColor: colors.line },
  node: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface },
  awb: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  thumb: { width: 56, height: 70, borderRadius: radius.sm, backgroundColor: colors.sand },
  histDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line, marginTop: 6 },
  note: {
    marginTop: 16,
    minHeight: 84,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
  },
});
