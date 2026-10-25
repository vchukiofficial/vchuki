import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft, Download, Heart, MapPin, PenLine, Ruler, Share2, ShoppingBag, Sparkles, Truck, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/ProductCard';
import { Sheet } from '@/components/Sheet';
import { Button, Chip, Divider, ErrorState, IconBtn, Pill, Skeleton, Stars, T, Tap } from '@/components/ui';
import { api, img } from '@/lib/api';
import { categoryName, SIZE_CHART, sortSizes } from '@/lib/catalog';
import { percentOff, rupee } from '@/lib/pricing';
import type { ProductDetail, Variant } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useBackToHome } from '@/lib/useSystemBack';
import { openProductActions } from '@/components/ProductActions';
import { savePhotos, sharePhoto } from '@/lib/share';
import { useAuth } from '@/store/auth';
import { useCart, useCartCount } from '@/store/cart';
import { useConfig } from '@/store/config';
import { useWishlist } from '@/store/wishlist';
import { colors, fonts, GUTTER, radius, shadow, space } from '@/theme';

const { width: W, height: H } = Dimensions.get('window');
/** Cinematic, near full-screen editorial gallery. */
const IMG_H = Math.min(W * 1.45, H * 0.76);

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, error, loading, reload } = useFetch<ProductDetail>(slug ? `/api/mobile/products/${encodeURIComponent(slug)}` : null);
  const insets = useSafeAreaInsets();
  const cfg = useConfig((s) => s.config);
  const signedIn = useAuth((s) => !!s.token);
  const add = useCart((s) => s.add);
  const bagCount = useCartCount();
  const saved = useWishlist((s) => (data ? s.ids.includes(data.product._id) : false));
  const toggleWish = useWishlist((s) => s.toggle);

  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [slide, setSlide] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const [zoomAt, setZoomAt] = useState(0);
  const [guide, setGuide] = useState(false);
  const [sizeNudge, setSizeNudge] = useState(false);
  const [added, setAdded] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  useBackToHome();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  const shake = useRef(new Animated.Value(0)).current;

  const variants = data?.variants || [];
  const colorsList = useMemo(() => {
    const seen = new Map<string, { name: string; hex: string }>();
    variants.forEach((v) => v.color?.name && !seen.has(v.color.name) && seen.set(v.color.name, v.color));
    return [...seen.values()];
  }, [variants]);

  useEffect(() => {
    if (!color && colorsList.length) setColor(colorsList[0].name);
  }, [colorsList, color]);

  const forColor = variants.filter((v) => !color || v.color?.name === color);
  const sizes = sortSizes([...new Set(forColor.map((v) => v.size).filter(Boolean))]);
  const selected: Variant | undefined = forColor.find((v) => v.size === size);
  const price = (data?.product.basePrice || 0) + (selected?.priceAdjustment || 0);
  const off = percentOff(price, data?.product.comparePrice);
  const images = (selected?.images?.length ? selected.images : forColor.find((v) => v.images?.length)?.images) || data?.product.images || [];
  const anyStock = forColor.some((v) => v.stock > 0);

  const headerBg = scrollY.interpolate({ inputRange: [IMG_H - 140, IMG_H - 60], outputRange: [0, 1], extrapolate: 'clamp' });

  function nudgeSize() {
    setSizeNudge(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Animated.sequence(
      [8, -8, 6, -6, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 55, useNativeDriver: true })),
    ).start();
  }

  function addToBag(goCheckout = false) {
    if (!data) return;
    if (!selected) return nudgeSize();
    if (selected.stock <= 0) return;
    add({
      productId: data.product._id,
      variantId: selected._id,
      slug: data.product.slug,
      name: data.product.name,
      image: images[0] || data.product.images[0] || '',
      price,
      size: selected.size,
      color: selected.color?.name || '',
      category: data.product.category,
      maxStock: selected.stock,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (goCheckout) {
      router.push('/checkout');
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  if (error && !data) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top + 60 }}>
        <ErrorState message={error} onRetry={reload} />
        <Button title="Go back" kind="ghost" onPress={goBack} />
      </View>
    );
  }

  if (loading || !data) {
    return (
      <View style={{ flex: 1 }}>
        <Skeleton style={{ width: W, height: IMG_H, borderRadius: 0 }} />
        <View style={{ padding: GUTTER, gap: 12 }}>
          <Skeleton style={{ width: 120, height: 12 }} />
          <Skeleton style={{ width: W * 0.75, height: 28 }} />
          <Skeleton style={{ width: 100, height: 22 }} />
        </View>
      </View>
    );
  }

  const p = data.product;

  return (
    <View style={{ flex: 1 }}>
      {/* Header that fades in over the gallery */}
      <View style={[st.header, { paddingTop: insets.top + 4 }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg, opacity: headerBg, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line }]} />
        <IconBtn label="Back" onPress={goBack} style={st.glass}>
          <ChevronLeft size={22} color={colors.ink} strokeWidth={1.7} />
        </IconBtn>
        <Animated.Text numberOfLines={1} style={[st.headerTitle, { opacity: headerBg }]}>
          {p.name}
        </Animated.Text>
        <IconBtn label="Share" onPress={() => openProductActions(p, images[slide], images)} style={st.glass}>
          <Share2 size={18} color={colors.ink} strokeWidth={1.7} />
        </IconBtn>
        <IconBtn label="Bag" onPress={() => router.push('/(tabs)/bag')} style={[st.glass, { marginLeft: 6 }]}>
          <ShoppingBag size={18} color={colors.ink} strokeWidth={1.7} />
          {bagCount > 0 && <View style={st.bagDot} />}
        </IconBtn>
      </View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}>
        {/* Gallery */}
        <View>
          <FlatList
            data={images.length ? images : ['']}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(u, i) => `${u}-${i}`}
            onMomentumScrollEnd={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / W))}
            renderItem={({ item, index }) => (
              <Pressable onPress={() => {
                setZoom(index);
                setZoomAt(index);
              }} onLongPress={() => openProductActions(data.product, item, images)} accessibilityLabel={`Photo ${index + 1} of ${images.length}, open full screen`}>
                <Image source={{ uri: img(item) }} style={{ width: W, height: IMG_H, backgroundColor: colors.sand }} contentFit="cover" transition={200} />
              </Pressable>
            )}
          />
          <LinearGradient pointerEvents="none" colors={['rgba(250,248,245,0)', colors.bg]} style={st.fade} />
          {images.length > 1 && (
            <View style={st.dots}>
              {images.map((_, i) => (
                <View key={i} style={[st.dot, i === slide && st.dotActive]} />
              ))}
            </View>
          )}
          {off > 0 && (
            <View style={st.offBadge}>
              <T v="caption" style={{ color: colors.nightText, fontFamily: fonts.semibold, letterSpacing: 0.8 }}>
                {off}% OFF
              </T>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: GUTTER, paddingTop: space.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <T v="eyebrow">{categoryName(p.category)}</T>
              <T v="h1" style={{ marginTop: 6, fontSize: 27, lineHeight: 33 }}>
                {p.name}
              </T>
            </View>
            <Tap
              accessibilityLabel={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              onPress={() => toggleWish(p._id, signedIn)}
              style={st.wish}>
              <Heart size={20} strokeWidth={1.7} color={saved ? colors.danger : colors.ink} fill={saved ? colors.danger : 'transparent'} />
            </Tap>
          </View>

          {data.rating.count > 0 && (
            <Tap onPress={() => {}} haptic={false} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <Stars value={data.rating.average} />
              <T v="caption" style={{ color: colors.ink }}>
                {data.rating.average.toFixed(1)} · {data.rating.count} {data.rating.count === 1 ? 'review' : 'reviews'}
              </T>
            </Tap>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 14 }}>
            <T style={{ fontFamily: fonts.semibold, fontSize: 26, color: colors.ink }}>{rupee(price)}</T>
            {!!p.comparePrice && p.comparePrice > price && (
              <T v="small" style={{ textDecorationLine: 'line-through', color: colors.faint }}>
                {rupee(p.comparePrice)}
              </T>
            )}
            {off > 0 && <Pill tone="success">{`Save ${rupee((p.comparePrice || 0) - price)}`}</Pill>}
          </View>
          <T v="caption" style={{ marginTop: 3 }}>
            Inclusive of all taxes
          </T>

          {/* Colour */}
          {(colorsList.length > 0 || data.siblingColors.length > 0) && (
            <View style={{ marginTop: space.xxl }}>
              <T v="title" style={{ fontSize: 13.5 }}>
                Colour <T v="small">· {color}</T>
              </T>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 12 }}>
                {colorsList.map((c) => (
                  <Swatch
                    key={c.name}
                    hex={c.hex}
                    name={c.name}
                    active={color === c.name}
                    onPress={() => {
                      setColor(c.name);
                      setSize(null);
                      setSlide(0);
                    }}
                  />
                ))}
                {data.siblingColors
                  .filter((c) => !colorsList.some((own) => own.name === c.name))
                  .map((c) => (
                    <Swatch key={c.slug} hex={c.hex} name={c.name} onPress={() => router.replace({ pathname: '/product/[slug]', params: { slug: c.slug } })} />
                  ))}
              </ScrollView>
            </View>
          )}

          {/* Size */}
          <Animated.View style={{ marginTop: space.md, transform: [{ translateX: shake }] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <T v="title" style={{ fontSize: 13.5, color: sizeNudge && !size ? colors.danger : colors.ink }}>
                {sizeNudge && !size ? 'Please pick a size' : 'Size'}
              </T>
              <Tap onPress={() => setGuide(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }} hitSlop={8}>
                <Ruler size={14} color={colors.accentDeep} />
                <T v="caption" style={{ color: colors.accentDeep, fontFamily: fonts.semibold }}>
                  Size guide
                </T>
              </Tap>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {sizes.map((sz) => {
                const v = forColor.find((x) => x.size === sz);
                const out = !v || v.stock <= 0;
                return (
                  <Chip
                    key={sz}
                    label={sz}
                    active={size === sz}
                    disabled={out}
                    strike={out}
                    onPress={() => {
                      setSize(sz);
                      setSizeNudge(false);
                    }}
                  />
                );
              })}
            </View>
            {!!selected && (
              <T v="caption" style={{ marginTop: 10, color: selected.stock <= 5 ? colors.warning : colors.success, fontFamily: fonts.semibold }}>
                {selected.stock <= 0 ? 'Out of stock' : selected.stock <= 5 ? `Only ${selected.stock} left — selling fast` : '✓ In stock, ready to ship'}
              </T>
            )}
            {!anyStock && sizes.length > 0 && (
              <T v="caption" style={{ marginTop: 10, color: colors.danger }}>
                Sold out in this colour. New stock is on the way.
              </T>
            )}
          </Animated.View>

          <DeliveryCheck days={cfg.deliveryDays} free={price >= cfg.freeShippingThreshold} threshold={cfg.freeShippingThreshold} fee={cfg.shippingFee} />

          <ComboHint category={p.category} name={p.name} />

          {/* Details */}
          <View style={{ marginTop: space.xxl }}>
            <T v="h3">The details</T>
            <T v="body" style={{ marginTop: 8 }}>
              {p.description}
            </T>
            <View style={st.specs}>
              <Spec label="Fabric" value={selected?.fabric || forColor[0]?.fabric || cfg.defaultFabric} />
              <Spec label="Fit" value={cap(selected?.fit || forColor[0]?.fit || 'regular')} />
              <Spec label="Care" value="Gentle wash, dry in shade" />
              <Spec label="Made in" value="Jodhpur, India" />
            </View>
          </View>
        </View>

        <Reviews detail={data} />

        {data.related.length > 0 && (
          <View style={{ marginTop: space.xxxl }}>
            <T v="h2" style={{ paddingHorizontal: GUTTER, marginBottom: space.lg }}>
              You may also like
            </T>
            <FlatList
              horizontal
              data={data.related}
              keyExtractor={(r) => r._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 14 }}
              renderItem={({ item }) => <ProductCard product={item} width={W * 0.42} />}
            />
          </View>
        )}
      </Animated.ScrollView>

      {/* Sticky purchase bar */}
      <View style={[st.buyBar, { paddingBottom: insets.bottom + 10 }]}>
        {added ? (
          <View style={st.addedRow}>
            <View style={st.addedIcon}>
              <Check size={16} color={colors.onAccent} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <T v="title" style={{ fontSize: 14 }}>
                Added to your bag
              </T>
              <T v="caption">
                {size} · {color}
              </T>
            </View>
            <Button title="View bag" compact onPress={() => router.push('/(tabs)/bag')} />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              title={!anyStock && sizes.length ? 'Sold out' : 'Add to bag'}
              kind="outline"
              disabled={(!!selected && selected.stock <= 0) || (!anyStock && sizes.length > 0)}
              onPress={() => addToBag(false)}
              style={{ flex: 1 }}
            />
            <Button
              title="Buy now"
              disabled={(!!selected && selected.stock <= 0) || (!anyStock && sizes.length > 0)}
              onPress={() => addToBag(true)}
              style={{ flex: 1 }}
            />
          </View>
        )}
      </View>

      <Sheet open={guide} onClose={() => setGuide(false)} title="Size guide">
        <T v="eyebrow" style={{ marginBottom: 10 }}>
          Finished garment · inches
        </T>
        <View style={st.table}>
          {[{ size: 'Size', shoulder: 'Shoulder', chest: 'Chest', length: 'Length' }, ...SIZE_CHART].map((r, i) => (
            <View key={r.size} style={[st.tr, i === 0 && { backgroundColor: colors.night }]}>
              {[r.size, r.shoulder, r.chest, r.length].map((cell, j) => (
                <T
                  key={j}
                  v={i === 0 ? 'caption' : 'small'}
                  style={[{ flex: 1, textAlign: j === 0 ? 'left' : 'center', color: i === 0 ? colors.nightText : colors.ink }, j === 0 && i > 0 && { fontFamily: fonts.semibold }]}>
                  {cell}
                </T>
              ))}
            </View>
          ))}
        </View>
        <T v="small" style={{ marginTop: 14 }}>
          Lay your best-fitting shirt flat and measure chest across, armpit to armpit, then double it. Between sizes? Size up for a relaxed fit — linen softens but doesn’t stretch.
        </T>
        <View style={{ height: 16 }} />
      </Sheet>

      <Modal visible={zoom !== null} animationType="fade" onRequestClose={() => setZoom(null)} statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: '#0C0906' }}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            initialScrollIndex={zoom ?? 0}
            onMomentumScrollEnd={(e) => setZoomAt(Math.round(e.nativeEvent.contentOffset.x / W))}
            getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
            keyExtractor={(u, i) => `${u}-z-${i}`}
            renderItem={({ item }) => (
              <ScrollView maximumZoomScale={3} minimumZoomScale={1} centerContent showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <Image source={{ uri: img(item) }} style={{ width: W, height: W * 1.33 }} contentFit="contain" />
              </ScrollView>
            )}
          />
          <IconBtn label="Close photos" onPress={() => setZoom(null)} style={{ position: 'absolute', top: insets.top + 8, right: 14, backgroundColor: 'rgba(255,255,255,0.14)' }}>
            <X size={22} color={colors.white} />
          </IconBtn>
          <View style={[st.zoomBar, { bottom: insets.bottom + 24 }]}>
            <Button title="Share photo" kind="accent" compact icon={<Share2 size={15} color={colors.onAccent} />} onPress={() => sharePhoto(p, images[zoomAt])} style={{ flex: 1 }} />
            <Button title={`Save all (${images.length})`} kind="outline" compact icon={<Download size={15} color={colors.nightText} />} onPress={() => savePhotos(p, images)} style={{ flex: 1, borderColor: colors.nightText }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Swatch({ hex, name, active, onPress }: { hex: string; name: string; active?: boolean; onPress: () => void }) {
  return (
    <Tap onPress={onPress} accessibilityLabel={`Colour ${name}`} accessibilityState={{ selected: active }} style={{ alignItems: 'center', width: 56 }}>
      <View style={[st.swatchRing, active && { borderColor: colors.ink }]}>
        <View style={[st.swatch, { backgroundColor: hex || colors.sand }]} />
      </View>
      <T v="caption" numberOfLines={1} style={{ marginTop: 5, fontSize: 10.5, color: active ? colors.ink : colors.muted }}>
        {name}
      </T>
    </Tap>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: '50%', paddingVertical: 10 }}>
      <T v="caption">{label}</T>
      <T v="title" style={{ fontSize: 13.5, marginTop: 2 }}>
        {value}
      </T>
    </View>
  );
}

function DeliveryCheck({ days, free, threshold, fee }: { days: string; free: boolean; threshold: number; fee: number }) {
  const [pin, setPin] = useState('');
  const [state, setState] = useState<{ loading?: boolean; ok?: boolean; text?: string }>({});
  async function check(code: string) {
    setState({ loading: true });
    try {
      const r = await api<{ valid: boolean; city?: string; state?: string }>(`/api/location/pincode/${code}`);
      setState(r.valid ? { ok: true, text: `Delivers to ${r.city}, ${r.state} in ${days} days · COD available` } : { ok: false, text: 'We couldn’t find that pincode.' });
    } catch {
      setState({ ok: false, text: 'Enter a valid 6-digit pincode.' });
    }
  }
  return (
    <View style={st.delivery}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <MapPin size={18} color={colors.accentDeep} strokeWidth={1.6} />
        <TextInput
          value={pin}
          onChangeText={(t) => {
            const v = t.replace(/\D/g, '').slice(0, 6);
            setPin(v);
            if (v.length === 6) check(v);
            else setState({});
          }}
          keyboardType="number-pad"
          placeholder="Enter pincode to check delivery"
          placeholderTextColor={colors.faint}
          style={{ flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.ink, height: 40 }}
          maxLength={6}
        />
        {state.loading && <ActivityIndicator size="small" color={colors.accent} />}
      </View>
      {!!state.text && (
        <T v="caption" style={{ marginTop: 6, color: state.ok ? colors.success : colors.danger }}>
          {state.text}
        </T>
      )}
      <Divider style={{ marginVertical: 12 }} />
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Truck size={18} color={colors.accentDeep} strokeWidth={1.6} />
        <T v="small" style={{ flex: 1, color: colors.inkSoft }}>
          Ships from Jodhpur · {free ? 'Free shipping' : `₹${fee} shipping (free above ${rupee(threshold)})`} · 7-day returns
        </T>
      </View>
    </View>
  );
}

function ComboHint({ category, name }: { category: string; name: string }) {
  const kurta = category.startsWith('kurta') || /kurta/i.test(name);
  const half = category === 'linen-half-sleeve';
  const line = kurta
    ? 'Buy any 3 kurtas, save 20% — or pair with a shirt for up to 20% off.'
    : half
      ? 'Buy any 3 half-sleeve shirts, save 15% — or pair with a kurta.'
      : 'Buy any 3 full-sleeve shirts, save 15% — or pair with a kurta.';
  return (
    <View style={st.combo}>
      <Sparkles size={18} color={colors.accent} strokeWidth={1.6} />
      <View style={{ flex: 1 }}>
        <T v="title" style={{ color: colors.nightText, fontSize: 13.5 }}>
          Bundle & save
        </T>
        <T v="caption" style={{ color: 'rgba(245,230,211,0.7)', marginTop: 2 }}>
          {line} Applied automatically in your bag.
        </T>
      </View>
    </View>
  );
}

function Reviews({ detail }: { detail: ProductDetail }) {
  const { reviews, rating, product } = detail;
  const photos = reviews.flatMap((r) => r.images).slice(0, 12);
  const [shown, setShown] = useState(3);
  const signedIn = useAuth((s) => !!s.token);

  return (
    <View style={{ marginTop: space.xxxl, paddingHorizontal: GUTTER }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <T v="eyebrow">Customer reviews</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <T style={{ fontFamily: fonts.display, fontSize: 34, color: colors.ink }}>{rating.count ? rating.average.toFixed(1) : '—'}</T>
            <View>
              <Stars value={rating.average} size={14} />
              <T v="caption" style={{ marginTop: 3 }}>
                {rating.count ? `Based on ${rating.count} ${rating.count === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}
              </T>
            </View>
          </View>
        </View>
      </View>

      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16, marginHorizontal: -GUTTER }} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 8 }}>
          {photos.map((u, i) => (
            <Image key={`${u}-${i}`} source={{ uri: img(u) }} style={{ width: 84, height: 84, borderRadius: radius.sm, backgroundColor: colors.sand }} contentFit="cover" />
          ))}
        </ScrollView>
      )}

      {reviews.slice(0, shown).map((r) => (
        <View key={r._id} style={st.review}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stars value={r.rating} size={12} />
            <T v="caption">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</T>
          </View>
          {!!r.comment && (
            <T v="body" style={{ marginTop: 8, fontSize: 14.5 }}>
              {r.comment}
            </T>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <T v="caption" style={{ color: colors.ink, fontFamily: fonts.semibold }}>
              {r.userName}
            </T>
            {r.verifiedPurchase && <Pill tone="success">Verified buyer</Pill>}
          </View>
        </View>
      ))}
      {reviews.length > shown && <Button title={`Show all ${reviews.length} reviews`} kind="ghost" compact onPress={() => setShown(reviews.length)} />}

      <Button
        title="Write a review"
        kind="outline"
        compact
        icon={<PenLine size={15} color={colors.ink} />}
        onPress={() =>
          signedIn
            ? router.push({ pathname: '/review/[productId]', params: { productId: product._id, name: product.name } })
            : router.push({ pathname: '/auth/login', params: { reason: 'review' } })
        }
        style={{ marginTop: space.lg }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8 },
  glass: { backgroundColor: colors.glass, ...shadow.card },
  headerTitle: { flex: 1, textAlign: 'center', marginHorizontal: 10, fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  bagDot: { position: 'absolute', top: 9, right: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 },
  dots: { position: 'absolute', bottom: 16, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(237,230,218,0.4)' },
  dotActive: { width: 20, backgroundColor: colors.accent },
  offBadge: { position: 'absolute', left: GUTTER, bottom: 14, backgroundColor: colors.night, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 4 },
  wish: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', marginLeft: 12, backgroundColor: colors.surface },
  swatchRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.15)' },
  delivery: { marginTop: space.xxl, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  combo: { marginTop: space.md, flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.night, borderRadius: radius.lg, padding: 16 },
  specs: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  review: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  buyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    backgroundColor: colors.bar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  addedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 54 },
  addedIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  zoomBar: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', gap: 10 },
  table: { borderRadius: radius.md, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  tr: { flexDirection: 'row', paddingVertical: 11, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.surface },
});
