import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Mail, MessageCircle, Phone, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { confirm, fmtDateTime, inr, SectionLabel, StudioHeader } from '@/components/admin';
import { Sheet } from '@/components/Sheet';
import { Button, Card, Chip, Divider, ErrorState, Pill, Row, Skeleton, T, Tap } from '@/components/ui';
import { api, img } from '@/lib/api';
import { STATUS_LABEL, STATUS_TONE } from '@/lib/orderStatus';
import type { Order, ShippingStatus } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { colors, fonts, GUTTER, radius } from '@/theme';

type AdminOrder = Order & { channel?: string; guestEmail?: string; guestPhone?: string; user?: string };

/** What the "next step" button does for each status. */
const NEXT: Partial<Record<ShippingStatus, { to: ShippingStatus; label: string }>> = {
  pending: { to: 'confirmed', label: 'Confirm order' },
  confirmed: { to: 'packaging', label: 'Start packing' },
  packaging: { to: 'dispatched', label: 'Mark dispatched' },
  dispatched: { to: 'out_for_delivery', label: 'Out for delivery' },
  shipped: { to: 'out_for_delivery', label: 'Out for delivery' },
  out_for_delivery: { to: 'delivered', label: 'Mark delivered' },
};

const ALL: ShippingStatus[] = ['pending', 'confirmed', 'packaging', 'dispatched', 'shipped', 'out_for_delivery', 'delivered', 'returned', 'cancelled'];
const COURIERS = ['Delhivery', 'Shiprocket', 'Blue Dart', 'DTDC', 'Ekart', 'India Post', 'Xpressbees'];

export default function AdminOrder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data, error, loading, reload, setData } = useFetch<{ order: AdminOrder }>(id ? `/api/orders/${id}` : null);
  const [busy, setBusy] = useState<string | null>(null);
  const [shipOpen, setShipOpen] = useState(false);
  const [courier, setCourier] = useState('');
  const [awb, setAwb] = useState('');
  const [note, setNote] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);

  async function patch(body: Record<string, unknown>, label: string) {
    setBusy(label);
    try {
      const updated = await api<AdminOrder>(`/api/orders/${id}`, { method: 'PATCH', body });
      setData({ order: updated });
    } catch (e: any) {
      Alert.alert('Not saved', e.message);
    } finally {
      setBusy(null);
    }
  }

  if (error && !data) {
    return (
      <View style={{ flex: 1 }}>
        <StudioHeader title="Order" />
        <ErrorState message={error} onRetry={reload} />
      </View>
    );
  }
  if (loading || !data) {
    return (
      <View style={{ flex: 1 }}>
        <StudioHeader title="Order" />
        <View style={{ padding: GUTTER, gap: 12 }}>
          <Skeleton style={{ height: 120 }} />
          <Skeleton style={{ height: 200 }} />
        </View>
      </View>
    );
  }

  const o = data.order;
  const ref = o._id.slice(-8).toUpperCase();
  const phone = (o.shippingAddress?.phone || o.guestPhone || '').replace(/\D/g, '').slice(-10);
  const email = o.guestEmail;
  const next = NEXT[o.shippingStatus];
  const isStore = o.channel === 'store';

  function advance() {
    if (!next) return;
    if (next.to === 'dispatched') {
      setCourier(o.courier || '');
      setAwb(o.awb || '');
      setShipOpen(true);
      return;
    }
    patch({ shippingStatus: next.to }, 'next');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StudioHeader title={`#${ref}`} subtitle={`${isStore ? 'Shop counter' : 'Online'} · ${fmtDateTime(o.createdAt)}`} />
      <ScrollView contentContainerStyle={{ padding: GUTTER, paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <Pill tone={STATUS_TONE[o.shippingStatus]}>{STATUS_LABEL[o.shippingStatus]}</Pill>
          <Pill tone={o.paymentStatus === 'paid' ? 'success' : 'warning'}>{`${o.paymentMethod.toUpperCase()} · ${o.paymentStatus}`}</Pill>
        </View>

        {/* Customer */}
        <Card style={{ marginTop: 14 }}>
          <T v="title">{o.shippingAddress?.name || 'Customer'}</T>
          {!isStore && (
            <T v="small" style={{ marginTop: 4 }}>
              {o.shippingAddress?.street}, {o.shippingAddress?.city}, {o.shippingAddress?.state} {o.shippingAddress?.zip}
            </T>
          )}
          <T v="caption" style={{ marginTop: 4 }}>
            {phone ? `+91 ${phone}` : 'No phone'} {email ? `· ${email}` : ''}
          </T>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            {!!phone && (
              <>
                <Tap onPress={() => Linking.openURL(`tel:+91${phone}`)} style={st.contact}>
                  <Phone size={15} color={colors.ink} />
                  <T v="caption" style={st.contactTxt}>
                    Call
                  </T>
                </Tap>
                <Tap
                  onPress={() =>
                    Linking.openURL(
                      `https://wa.me/91${phone}?text=${encodeURIComponent(`Hi ${o.shippingAddress?.name?.split(' ')[0] || ''}, this is VCHUKI about your order #${ref} (${inr(o.finalAmount)}).`)}`,
                    )
                  }
                  style={st.contact}>
                  <MessageCircle size={15} color={colors.success} />
                  <T v="caption" style={st.contactTxt}>
                    WhatsApp
                  </T>
                </Tap>
              </>
            )}
            {!!email && (
              <Tap onPress={() => Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(`Your VCHUKI order #${ref}`)}`)} style={st.contact}>
                <Mail size={15} color={colors.ink} />
                <T v="caption" style={st.contactTxt}>
                  Email
                </T>
              </Tap>
            )}
          </View>
        </Card>

        {/* Return */}
        {!!o.returnRequest && (
          <Card style={{ marginTop: 12, backgroundColor: colors.dangerWash, borderColor: colors.dangerWash }}>
            <T v="title" style={{ color: colors.danger }}>
              Return {o.returnRequest.status}
            </T>
            <T v="small" style={{ marginTop: 4, color: colors.inkSoft }}>
              {o.returnRequest.reason}
            </T>
            <T v="caption" style={{ marginTop: 4 }}>
              Requested {fmtDateTime(o.returnRequest.requestedAt)}
            </T>
            {(o.paymentStatus as string) !== 'refunded' && (
              <Button
                title="Mark refunded"
                kind="outline"
                compact
                loading={busy === 'refund'}
                onPress={() => confirm('Mark as refunded?', `Confirm you have refunded ${inr(o.finalAmount)} to the customer.`, 'Refunded', () => patch({ paymentStatus: 'refunded', timeline: { event: 'Refund issued', timestamp: new Date() } }, 'refund'), false)}
                style={{ marginTop: 12, alignSelf: 'flex-start' }}
              />
            )}
          </Card>
        )}

        {/* Shipping */}
        {!isStore && (
          <>
            <SectionLabel>Shipping</SectionLabel>
            <Card>
              <Row label="Courier" value={o.courier || '—'} />
              <Row label="AWB" value={o.awb || '—'} />
              <Button title={o.awb ? 'Edit courier / AWB' : 'Add courier & AWB'} kind="ghost" compact onPress={() => { setCourier(o.courier || ''); setAwb(o.awb || ''); setShipOpen(true); }} style={{ alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 0 }} />
            </Card>
          </>
        )}

        {/* Items */}
        <SectionLabel>Items</SectionLabel>
        <Card>
          {o.items.map((i, k) => (
            <View key={k} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <Image source={{ uri: img(i.image) }} style={{ width: 46, height: 58, borderRadius: 6, backgroundColor: colors.sand }} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <T v="small" style={{ color: colors.ink, fontFamily: fonts.medium }} numberOfLines={2}>
                  {i.name}
                </T>
                <T v="caption">
                  Size {i.size} · {i.color} · ×{i.quantity}
                </T>
              </View>
              <T v="small" style={{ color: colors.ink }}>
                {inr(i.price * i.quantity)}
              </T>
            </View>
          ))}
          <Divider style={{ marginBottom: 8 }} />
          <Row label="Subtotal" value={inr(o.totalAmount)} />
          {o.discountAmount > 0 && <Row label={`Discount${o.couponCode ? ` · ${o.couponCode}` : ''}`} value={`−${inr(o.discountAmount)}`} tone="success" />}
          {!!o.codCharge && <Row label="COD fee" value={inr(o.codCharge)} />}
          <Row label="Total" value={inr(o.finalAmount)} strong />
        </Card>

        {/* Payment */}
        <SectionLabel>Payment</SectionLabel>
        <Card>
          <Row label="Method" value={o.paymentMethod.toUpperCase()} />
          <Row label="Status" value={o.paymentStatus} />
          {o.paymentStatus !== 'paid' && (
            <Button
              title={o.paymentMethod === 'cod' ? 'Cash collected' : 'Mark paid'}
              kind="outline"
              compact
              loading={busy === 'paid'}
              onPress={() => confirm('Mark as paid?', `Only do this once ${inr(o.finalAmount)} is in the bank.`, 'Mark paid', () => patch({ paymentStatus: 'paid', timeline: { event: 'Payment received', timestamp: new Date() } }, 'paid'), false)}
              style={{ marginTop: 10, alignSelf: 'flex-start' }}
            />
          )}
        </Card>

        {/* Timeline + note */}
        <SectionLabel>Timeline</SectionLabel>
        <Card>
          {[...o.timeline].reverse().map((t, k) => (
            <View key={k} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <View style={[st.dot, k === 0 && { backgroundColor: colors.accent }]} />
              <View style={{ flex: 1 }}>
                <T v="small" style={{ color: colors.ink }}>
                  {t.event}
                </T>
                <T v="caption">{fmtDateTime(t.timestamp)}</T>
              </View>
            </View>
          ))}
          <View style={st.noteRow}>
            <TextInput value={note} onChangeText={setNote} placeholder="Add a note (e.g. called customer)" placeholderTextColor={colors.faint} style={st.noteInput} />
            <Tap
              disabled={!note.trim()}
              onPress={async () => {
                await patch({ timeline: { event: note.trim(), timestamp: new Date() } }, 'note');
                setNote('');
              }}
              hitSlop={8}>
              <T v="caption" style={{ fontFamily: fonts.bold, color: note.trim() ? colors.ink : colors.faint, letterSpacing: 1 }}>
                ADD
              </T>
            </Tap>
          </View>
        </Card>

        <Button title="Change status manually" kind="ghost" compact onPress={() => setStatusOpen(true)} style={{ marginTop: 16 }} />
        <Tap
          onPress={() =>
            confirm('Delete this order?', 'This removes it permanently and puts the stock back. Use “Cancelled” instead if you want a record.', 'Delete', async () => {
              try {
                await api(`/api/orders/${id}`, { method: 'DELETE' });
                router.back();
              } catch (e: any) {
                Alert.alert('Not deleted', e.message);
              }
            })
          }
          style={st.delete}>
          <Trash2 size={15} color={colors.danger} />
          <T v="caption" style={{ color: colors.danger, fontFamily: fonts.semibold }}>
            Delete order
          </T>
        </Tap>
      </ScrollView>

      {/* Primary action */}
      {!!next && !isStore && (
        <View style={[st.bar, { paddingBottom: insets.bottom + 10 }]}>
          {o.shippingStatus === 'pending' && (
            <Button title="Cancel" kind="outline" onPress={() => confirm('Cancel this order?', 'Stock goes back on the shelf and the customer is emailed.', 'Cancel order', () => patch({ shippingStatus: 'cancelled' }, 'cancel'))} loading={busy === 'cancel'} style={{ flex: 0.7 }} />
          )}
          <Button title={next.label} onPress={advance} loading={busy === 'next'} style={{ flex: 1.3 }} />
        </View>
      )}

      <Sheet open={shipOpen} onClose={() => setShipOpen(false)} title="Courier & tracking">
        <T v="small" style={{ marginBottom: 10 }}>
          Enter the real AWB from the courier label — customers see this as their tracking number.
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {COURIERS.map((c) => (
            <Chip key={c} label={c} active={courier === c} onPress={() => setCourier(c)} />
          ))}
        </View>
        <TextInput value={courier} onChangeText={setCourier} placeholder="Courier name" placeholderTextColor={colors.faint} style={[st.input, { marginTop: 12 }]} />
        <TextInput value={awb} onChangeText={(v) => setAwb(v.trim())} placeholder="AWB / tracking number" placeholderTextColor={colors.faint} autoCapitalize="characters" style={st.input} />
        <Button
          title={o.shippingStatus === 'packaging' ? 'Save & mark dispatched' : 'Save'}
          disabled={!courier.trim() || !awb}
          loading={busy === 'ship'}
          onPress={async () => {
            await patch({ courier: courier.trim(), awb, ...(['pending', 'confirmed', 'packaging'].includes(o.shippingStatus) ? { shippingStatus: 'dispatched' } : {}) }, 'ship');
            setShipOpen(false);
          }}
          style={{ marginTop: 14 }}
        />
        <View style={{ height: 12 }} />
      </Sheet>

      <Sheet open={statusOpen} onClose={() => setStatusOpen(false)} title="Set status">
        {ALL.map((s) => (
          <Tap
            key={s}
            onPress={() => {
              setStatusOpen(false);
              if (s !== o.shippingStatus) patch({ shippingStatus: s }, 'status');
            }}
            style={st.statusRow}>
            <T v="body" style={{ color: colors.ink, flex: 1, fontFamily: s === o.shippingStatus ? fonts.semibold : fonts.body }}>
              {STATUS_LABEL[s]}
            </T>
            {s === o.shippingStatus && <Pill tone="dark">Current</Pill>}
          </Tap>
        ))}
        <T v="caption" style={{ marginVertical: 12 }}>
          Cancelled and returned put stock back automatically. Every change emails the customer.
        </T>
      </Sheet>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  contact: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 36, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bg },
  contactTxt: { color: colors.ink, fontFamily: fonts.semibold },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line, marginTop: 6 },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line, paddingTop: 10, marginTop: 4 },
  noteInput: { flex: 1, height: 40, fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  delete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, paddingVertical: 12 },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: GUTTER, paddingTop: 12, backgroundColor: colors.bar, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  input: { height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 15, color: colors.ink, marginTop: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
