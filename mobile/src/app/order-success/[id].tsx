import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, Clock, Package, Smartphone, Truck } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Alert, Animated, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Row, Skeleton, T } from '@/components/ui';
import { rupee } from '@/lib/pricing';
import type { Order } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useBackToHome } from '@/lib/useSystemBack';
import { useConfig } from '@/store/config';
import { colors, fonts, GUTTER, space } from '@/theme';

export default function OrderSuccess() {
  const { id, method } = useLocalSearchParams<{ id: string; method?: string }>();
  const insets = useSafeAreaInsets();
  const cfg = useConfig((s) => s.config);
  const { data } = useFetch<{ order: Order; ref: string; upiLink: string | null }>(id ? `/api/mobile/orders/${id}` : null);
  const pop = useRef(new Animated.Value(0)).current;
  const upi = method === 'upi';
  // Back never returns to checkout after an order is placed
  useBackToHome(() => router.replace('/(tabs)'));

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, [pop]);

  async function payNow() {
    if (!data?.upiLink) return;
    try {
      await Linking.openURL(data.upiLink);
    } catch {
      Alert.alert('No UPI app found', 'Install GPay, PhonePe or Paytm, or pay using the QR on vchuki.com from another device.');
    }
  }

  const steps = upi
    ? [
        { Icon: Clock, title: 'Awaiting payment', body: 'Complete the UPI payment to confirm', on: true },
        { Icon: Package, title: 'Packed with care', body: 'Starts once payment is confirmed', on: false },
        { Icon: Truck, title: 'On its way', body: `Delivered in ${cfg.deliveryDays} business days`, on: false },
      ]
    : [
        { Icon: Check, title: 'Order placed', body: 'We’ve received your order', on: true },
        { Icon: Package, title: 'Packed with care', body: 'Your piece is packed within 24h', on: false },
        { Icon: Truck, title: 'On its way', body: `Delivered in ${cfg.deliveryDays} business days`, on: false },
      ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 48, paddingHorizontal: GUTTER, paddingBottom: insets.bottom + 30 }}>
      <Animated.View style={[st.badge, upi && { backgroundColor: colors.warning }, { transform: [{ scale: pop }] }]}>
        {upi ? <Smartphone size={34} color={colors.onAccent} strokeWidth={1.6} /> : <Check size={38} color={colors.onAccent} strokeWidth={2.2} />}
      </Animated.View>
      <T v="h1" style={{ textAlign: 'center', marginTop: space.xl }}>
        {upi ? 'One last step' : 'Thank you!'}
      </T>
      <T v="body" style={{ textAlign: 'center', marginTop: 8 }}>
        {upi ? 'Your order is reserved. Pay with any UPI app to confirm it.' : 'Your order is confirmed. A confirmation email is on its way.'}
      </T>

      <Card style={{ marginTop: space.xxl }}>
        {data ? (
          <>
            <Row label="Order" value={`#${data.ref}`} />
            <Row label="Payment" value={upi ? 'UPI · pending' : 'Cash on delivery'} />
            <Row label={upi ? 'Amount to pay' : 'Total'} value={rupee(data.order.finalAmount)} strong />
          </>
        ) : (
          <View style={{ gap: 10 }}>
            <Skeleton style={{ height: 14 }} />
            <Skeleton style={{ height: 14, width: '70%' }} />
          </View>
        )}
      </Card>

      {upi && (
        <>
          <Button title={data ? `Pay ${rupee(data.order.finalAmount)} with UPI` : 'Preparing payment…'} kind="accent" onPress={payNow} disabled={!data?.upiLink} style={{ marginTop: space.lg }} />
          <T v="caption" style={{ textAlign: 'center', marginTop: 8 }}>
            Our team confirms UPI payments manually, usually within a few hours. You’ll find this order under Account → Orders.
          </T>
        </>
      )}

      <View style={{ marginTop: space.xxl }}>
        {steps.map(({ Icon, title, body, on }, i) => (
          <View key={title} style={{ flexDirection: 'row', gap: 14 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={[st.stepDot, on && { backgroundColor: colors.ink }]}>
                <Icon size={14} color={on ? colors.onInk : colors.muted} />
              </View>
              {i < steps.length - 1 && <View style={st.stepLine} />}
            </View>
            <View style={{ paddingBottom: 22, flex: 1 }}>
              <T v="title" style={{ fontSize: 14, color: on ? colors.ink : colors.muted }}>
                {title}
              </T>
              <T v="caption">{body}</T>
            </View>
          </View>
        ))}
      </View>

      <Button title="View my orders" kind="outline" onPress={() => router.replace('/orders')} style={{ marginTop: space.md }} />
      <Button title="Continue shopping" kind="ghost" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 4 }} />
      <T v="caption" style={{ textAlign: 'center', marginTop: space.md, fontFamily: fonts.medium }}>
        Questions? {cfg.supportEmail}
      </T>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  badge: { alignSelf: 'center', width: 84, height: 84, borderRadius: 42, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  stepDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 1.5, flex: 1, backgroundColor: colors.line, marginVertical: 3 },
});
