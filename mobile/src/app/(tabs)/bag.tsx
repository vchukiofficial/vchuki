import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Minus, Plus, ShoppingBag, Sparkles, Trash2, Truck } from 'lucide-react-native';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Divider, Empty, Row, T, Tap } from '@/components/ui';
import { img } from '@/lib/api';
import { rupee, totals } from '@/lib/pricing';
import type { CartItem } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useConfig } from '@/store/config';
import { colors, fonts, GUTTER, radius, space, TAB_SPACE } from '@/theme';

export default function Bag() {
  const insets = useSafeAreaInsets();
  const items = useCart((s) => s.items);
  const cfg = useConfig((s) => s.config);
  const signedIn = useAuth((s) => !!s.token);
  const t = totals(items, 0, cfg);
  const progress = Math.min(1, t.subtotal / cfg.freeShippingThreshold);
  const count = items.reduce((n, i) => n + i.quantity, 0);

  if (!items.length) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 40 }}>
        <Empty
          icon={<ShoppingBag size={32} color={colors.accentDeep} strokeWidth={1.4} />}
          title="Your bag is empty"
          body="Linen shirts and short kurtas, handcrafted in Jodhpur — find something that breathes."
          action="Start shopping"
          onAction={() => router.push('/(tabs)/shop')}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 12 }}>
        <T v="eyebrow">{count} {count === 1 ? 'item' : 'items'}</T>
        <T v="h1" style={{ marginTop: 4 }}>
          Your bag
        </T>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: TAB_SPACE + 110 }} showsVerticalScrollIndicator={false}>
        {/* Free-shipping progress */}
        <Card style={{ marginBottom: space.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Truck size={18} color={t.shipping === 0 ? colors.success : colors.accentDeep} strokeWidth={1.6} />
            <T v="small" style={{ flex: 1, color: colors.ink }}>
              {t.shipping === 0 ? (
                <T v="small" style={{ color: colors.success, fontFamily: fonts.semibold }}>
                  You’ve unlocked free shipping
                </T>
              ) : (
                <>
                  Add <T v="small" style={{ fontFamily: fonts.semibold, color: colors.ink }}>{rupee(t.toFreeShipping)}</T> more for free shipping
                </>
              )}
            </T>
          </View>
          <View style={st.track}>
            <View style={[st.fill, { width: `${progress * 100}%`, backgroundColor: t.shipping === 0 ? colors.success : colors.accent }]} />
          </View>
        </Card>

        {items.map((i) => (
          <Line key={i.key} item={i} />
        ))}

        {t.combo > 0 ? (
          <View style={st.combo}>
            <Sparkles size={17} color={colors.accent} />
            <T v="small" style={{ color: colors.nightText, flex: 1 }}>
              <T v="small" style={{ color: colors.accent, fontFamily: fonts.semibold }}>
                {t.comboLabel}
              </T>{' '}
              applied — you save {rupee(t.combo)}
            </T>
          </View>
        ) : (
          <T v="caption" style={{ marginTop: 6, textAlign: 'center' }}>
            Tip: any 3 shirts save 15%, 3 kurtas save 20% — applied automatically.
          </T>
        )}

        <Card style={{ marginTop: space.xl }}>
          <Row label="Subtotal" value={rupee(t.subtotal)} />
          {t.combo > 0 && <Row label="Bundle discount" value={`−${rupee(t.combo)}`} tone="success" />}
          <Row label="Shipping" value={t.shipping === 0 ? 'Free' : rupee(t.shipping)} tone={t.shipping === 0 ? 'success' : undefined} />
          <Divider style={{ marginVertical: 10 }} />
          <Row label="Total" value={rupee(t.total)} strong />
          <T v="caption" style={{ marginTop: 4 }}>
            Coupons and payment options at checkout.
          </T>
        </Card>
      </ScrollView>

      <View style={[st.checkoutBar, { bottom: TAB_SPACE - 18 }]}>
        <Button
          title={`Checkout · ${rupee(t.total)}`}
          onPress={() => (signedIn ? router.push('/checkout') : router.push({ pathname: '/auth/login', params: { reason: 'checkout' } }))}
        />
      </View>
    </View>
  );
}

function Line({ item }: { item: CartItem }) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  return (
    <View style={st.line}>
      <Tap onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: item.slug } })}>
        <Image source={{ uri: img(item.image) }} style={st.thumb} contentFit="cover" />
      </Tap>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <T v="title" numberOfLines={2} style={{ flex: 1, fontSize: 14 }}>
            {item.name}
          </T>
          <Tap
            accessibilityLabel={`Remove ${item.name}`}
            hitSlop={10}
            onPress={() =>
              Alert.alert('Remove item?', item.name, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => remove(item.key) },
              ])
            }>
            <Trash2 size={16} color={colors.muted} strokeWidth={1.6} />
          </Tap>
        </View>
        <T v="caption" style={{ marginTop: 4 }}>
          {item.size} · {item.color}
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <View style={st.stepper}>
            <Tap accessibilityLabel="Decrease quantity" onPress={() => setQty(item.key, item.quantity - 1)} disabled={item.quantity <= 1} style={st.stepBtn}>
              <Minus size={14} color={item.quantity <= 1 ? colors.faint : colors.ink} />
            </Tap>
            <T v="title" style={{ minWidth: 22, textAlign: 'center', fontSize: 14 }}>
              {item.quantity}
            </T>
            <Tap accessibilityLabel="Increase quantity" onPress={() => setQty(item.key, item.quantity + 1)} disabled={item.quantity >= item.maxStock} style={st.stepBtn}>
              <Plus size={14} color={item.quantity >= item.maxStock ? colors.faint : colors.ink} />
            </Tap>
          </View>
          <T v="price">{rupee(item.price * item.quantity)}</T>
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  track: { height: 4, borderRadius: 2, backgroundColor: colors.sand, marginTop: 12, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  line: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  thumb: { width: 92, height: 118, borderRadius: radius.md, backgroundColor: colors.sand },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, backgroundColor: colors.surface },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  combo: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.night, borderRadius: radius.md, padding: 14, marginTop: space.lg },
  checkoutBar: { position: 'absolute', left: GUTTER, right: GUTTER },
});
