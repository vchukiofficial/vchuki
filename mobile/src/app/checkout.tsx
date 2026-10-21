import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { Check, CheckCircle2, Circle, Lock, MapPin, Plus, Tag, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressForm } from '@/components/AddressForm';
import { Sheet } from '@/components/Sheet';
import { Button, Card, Divider, Header, Pill, Row, T, Tap } from '@/components/ui';
import { useBackToHome } from '@/lib/useSystemBack';
import { api, img } from '@/lib/api';
import { rupee, totals } from '@/lib/pricing';
import type { Address } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useConfig } from '@/store/config';
import { colors, fonts, GUTTER, radius, space } from '@/theme';

export default function Checkout() {
  useBackToHome();
  const insets = useSafeAreaInsets();
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const refreshUser = useAuth((s) => s.refresh);
  const { items, couponCode, couponDiscount, applyCoupon, clearCoupon, clear } = useCart();
  const cfg = useConfig((s) => s.config);

  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [selected, setSelected] = useState<number>(0);
  const [adding, setAdding] = useState(false);
  const [payment, setPayment] = useState<'upi' | 'cod'>(cfg.upiEnabled ? 'upi' : 'cod');
  const [code, setCode] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const t = totals(items, couponDiscount, cfg, payment);

  useEffect(() => {
    if (!token) return;
    api<{ addresses: Address[] }>('/api/users/me/addresses')
      .then((r) => {
        setAddresses(r.addresses);
        const d = r.addresses.findIndex((a) => a.isDefault);
        setSelected(d >= 0 ? d : 0);
        if (!r.addresses.length) setAdding(true);
      })
      .catch(() => setAddresses([]));
  }, [token]);

  if (!token) return <Redirect href={{ pathname: '/auth/login', params: { reason: 'checkout' } }} />;
  if (!items.length && !placing) return <Redirect href="/(tabs)/bag" />;

  async function redeem() {
    const c = code.trim().toUpperCase();
    if (!c) return;
    setCouponBusy(true);
    setCouponError(null);
    try {
      const r = await api<{ discount: number; code: string }>(`/api/coupons/validate?code=${encodeURIComponent(c)}&amount=${t.subtotal}`);
      if (!r.discount) throw new Error('This coupon doesn’t apply to your bag');
      applyCoupon(r.code, r.discount);
      setCode('');
    } catch (e: any) {
      setCouponError(e.message);
    } finally {
      setCouponBusy(false);
    }
  }

  async function saveAddress(a: Address) {
    try {
      const r = await api<{ addresses: Address[] }>('/api/users/me/addresses', { method: 'POST', body: { ...a, isDefault: !addresses?.length } });
      setAddresses(r.addresses);
      setSelected(r.addresses.length - 1);
      setAdding(false);
    } catch (e: any) {
      Alert.alert('Couldn’t save address', e.message);
    }
  }

  async function placeOrder() {
    const address = addresses?.[selected];
    if (!address) {
      setAdding(true);
      return;
    }
    setPlacing(true);
    try {
      const res = await api<{ orderId: string }>('/api/orders', {
        method: 'POST',
        body: {
          items: items.map((i) => ({
            product: i.productId,
            variant: i.variantId,
            name: i.name,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          shippingAddress: { name: address.name, street: address.street, city: address.city, state: address.state, zip: address.zip, phone: address.phone },
          paymentMethod: payment,
          couponCode: couponCode || undefined,
          totalAmount: t.subtotal,
          discountAmount: t.combo + t.coupon,
          finalAmount: t.total,
        },
      });
      clear();
      refreshUser();
      router.replace({ pathname: '/order-success/[id]', params: { id: String(res.orderId), method: payment } });
    } catch (e: any) {
      setPlacing(false);
      Alert.alert(e.status === 409 ? 'Stock changed' : 'Order not placed', e.message);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Checkout" right={<Lock size={16} color={colors.muted} />} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 140 + insets.bottom }} keyboardShouldPersistTaps="handled">
        {/* Step 1 — address */}
        <StepTitle n={1} title="Deliver to" />
        {addresses === null ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : (
          <>
            {addresses.map((a, i) => (
              <Tap key={a._id || i} onPress={() => setSelected(i)} style={[st.option, selected === i && st.optionActive]}>
                {selected === i ? <CheckCircle2 size={20} color={colors.ink} /> : <Circle size={20} color={colors.faint} />}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <T v="title" style={{ fontSize: 14 }}>
                      {a.name}
                    </T>
                    {a.isDefault && <Pill>Default</Pill>}
                  </View>
                  <T v="small" style={{ marginTop: 3 }}>
                    {a.street}, {a.city}, {a.state} {a.zip}
                  </T>
                  <T v="caption" style={{ marginTop: 3 }}>
                    +91 {a.phone}
                  </T>
                </View>
              </Tap>
            ))}
            <Tap onPress={() => setAdding(true)} style={st.addAddr}>
              <Plus size={16} color={colors.ink} />
              <T v="title" style={{ fontSize: 14 }}>
                Add a new address
              </T>
            </Tap>
          </>
        )}

        {/* Step 2 — payment */}
        <StepTitle n={2} title="Payment" />
        {cfg.upiEnabled && (
          <Tap onPress={() => setPayment('upi')} style={[st.option, payment === 'upi' && st.optionActive]}>
            {payment === 'upi' ? <CheckCircle2 size={20} color={colors.ink} /> : <Circle size={20} color={colors.faint} />}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <T v="title" style={{ fontSize: 14 }}>
                  UPI
                </T>
                <Pill tone="success">{`Save ₹${cfg.codFee}`}</Pill>
              </View>
              <T v="caption" style={{ marginTop: 3 }}>
                GPay, PhonePe, Paytm or any UPI app — opens right after you place the order
              </T>
            </View>
            <T v="price" style={{ fontSize: 14 }}>
              {rupee(totals(items, couponDiscount, cfg, 'upi').total)}
            </T>
          </Tap>
        )}
        <Tap onPress={() => setPayment('cod')} style={[st.option, payment === 'cod' && st.optionActive]}>
          {payment === 'cod' ? <CheckCircle2 size={20} color={colors.ink} /> : <Circle size={20} color={colors.faint} />}
          <View style={{ flex: 1 }}>
            <T v="title" style={{ fontSize: 14 }}>
              Cash on delivery
            </T>
            <T v="caption" style={{ marginTop: 3 }}>
              +₹{cfg.codFee} COD fee · pay when it arrives
            </T>
          </View>
          <T v="price" style={{ fontSize: 14 }}>
            {rupee(totals(items, couponDiscount, cfg, 'cod').total)}
          </T>
        </Tap>

        {/* Step 3 — review */}
        <StepTitle n={3} title="Order summary" />
        <Card>
          {items.map((i) => (
            <View key={i.key} style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <Image source={{ uri: img(i.image) }} style={{ width: 48, height: 60, borderRadius: radius.sm, backgroundColor: colors.sand }} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <T v="small" numberOfLines={1} style={{ color: colors.ink, fontFamily: fonts.medium }}>
                  {i.name}
                </T>
                <T v="caption">
                  {i.size} · {i.color} · Qty {i.quantity}
                </T>
              </View>
              <T v="small" style={{ color: colors.ink }}>
                {rupee(i.price * i.quantity)}
              </T>
            </View>
          ))}

          {/* Coupon */}
          {couponCode ? (
            <View style={st.couponApplied}>
              <Check size={16} color={colors.success} />
              <T v="small" style={{ flex: 1, color: colors.success, fontFamily: fonts.semibold }}>
                {couponCode} applied — {rupee(couponDiscount)} off
              </T>
              <Tap onPress={clearCoupon} accessibilityLabel="Remove coupon" hitSlop={10}>
                <X size={16} color={colors.muted} />
              </Tap>
            </View>
          ) : (
            <View>
              <View style={st.couponRow}>
                <Tag size={16} color={colors.muted} />
                <TextInput
                  value={code}
                  onChangeText={(v) => {
                    setCode(v.toUpperCase());
                    setCouponError(null);
                  }}
                  placeholder="Coupon code"
                  placeholderTextColor={colors.faint}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={st.couponInput}
                  onSubmitEditing={redeem}
                />
                <Tap onPress={redeem} disabled={!code || couponBusy} hitSlop={8}>
                  {couponBusy ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <T v="caption" style={{ color: code ? colors.ink : colors.faint, fontFamily: fonts.bold, letterSpacing: 1 }}>
                      APPLY
                    </T>
                  )}
                </Tap>
              </View>
              {!!couponError && (
                <T v="caption" style={{ color: colors.danger, marginTop: 6 }}>
                  {couponError}
                </T>
              )}
            </View>
          )}

          <Divider style={{ marginVertical: 14 }} />
          <Row label="Subtotal" value={rupee(t.subtotal)} />
          {t.combo > 0 && <Row label={t.comboLabel || 'Bundle discount'} value={`−${rupee(t.combo)}`} tone="success" />}
          {t.coupon > 0 && <Row label={`Coupon ${couponCode}`} value={`−${rupee(t.coupon)}`} tone="success" />}
          <Row label="Shipping" value={t.shipping ? rupee(t.shipping) : 'Free'} tone={t.shipping ? undefined : 'success'} />
          {t.cod > 0 && <Row label="COD fee" value={rupee(t.cod)} />}
          <Divider style={{ marginVertical: 10 }} />
          <Row label="To pay" value={rupee(t.total)} strong />
        </Card>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <MapPin size={13} color={colors.muted} />
          <T v="caption">Delivered in {cfg.deliveryDays} business days · 7-day returns</T>
        </View>
        {!!user && (
          <T v="caption" style={{ textAlign: 'center', marginTop: 4 }}>
            Confirmation goes to {user.email}
          </T>
        )}
      </ScrollView>

      <View style={[st.payBar, { paddingBottom: insets.bottom + 10 }]}>
        <View style={{ flex: 1 }}>
          <T v="caption">Total</T>
          <T style={{ fontFamily: fonts.semibold, fontSize: 21, color: colors.ink }}>{rupee(t.total)}</T>
        </View>
        <Button title={payment === 'upi' ? 'Place & pay' : 'Place order'} onPress={placeOrder} loading={placing} disabled={!addresses?.length} style={{ flex: 1.4 }} />
      </View>

      <Sheet open={adding} onClose={() => setAdding(false)} title="New address">
        <AddressForm initial={{ name: user?.name }} onSubmit={saveAddress} submitLabel="Deliver here" />
        <View style={{ height: 12 }} />
      </Sheet>
    </KeyboardAvoidingView>
  );
}

function StepTitle({ n, title }: { n: number; title: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: space.xxl, marginBottom: space.md }}>
      <View style={st.stepNum}>
        <T v="caption" style={{ color: colors.onInk, fontFamily: fonts.bold }}>
          {n}
        </T>
      </View>
      <T v="h3">{title}</T>
    </View>
  );
}

const st = StyleSheet.create({
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  option: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  optionActive: { borderColor: colors.ink, borderWidth: 1.5 },
  addAddr: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 4 },
  couponRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accent, borderRadius: radius.md, paddingHorizontal: 12, marginTop: 4 },
  couponInput: { flex: 1, height: 46, fontFamily: fonts.semibold, fontSize: 14, letterSpacing: 1, color: colors.ink },
  couponApplied: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.successWash, borderRadius: radius.md, padding: 12, marginTop: 4 },
  payBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    backgroundColor: colors.bar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
});
