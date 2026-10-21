import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as WebBrowser from 'expo-web-browser';
import { ArrowRight, BadgeCheck, RotateCcw, Search, Truck, Wallet } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/ProductCard';
import { ProductGrid } from '@/components/ProductGrid';
import { VipForm, WelcomeVip } from '@/components/VipSignup';
import { Button, ErrorState, IconBtn, Section, Skeleton, T, Tap } from '@/components/ui';
import { img, webUrl } from '@/lib/api';
import { CATEGORIES } from '@/lib/catalog';
import type { HomeFeed, Product } from '@/lib/types';
import { useFetch } from '@/lib/useFetch';
import { useDoubleBackToExit } from '@/lib/useSystemBack';
import { useConfig } from '@/store/config';
import { colors, fonts, GUTTER, radius, space, TAB_SPACE } from '@/theme';

const { width: W, height: H } = Dimensions.get('window');
const HERO_H = Math.min(H * 0.72, 640);

export default function Home() {
  const { data, error, loading, refreshing, refresh, reload } = useFetch<HomeFeed>('/api/mobile/home');
  const setConfig = useConfig((s) => s.set);
  useDoubleBackToExit();
  const insets = useSafeAreaInsets();
  const [solid, setSolid] = useState(false);
  const solidAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(solidAnim, { toValue: solid ? 1 : 0, duration: 220, useNativeDriver: false }).start();
  }, [solid, solidAnim]);

  useEffect(() => {
    if (data?.config) setConfig(data.config);
  }, [data, setConfig]);

  const products = useMemo(() => [...(data?.featured || []), ...(data?.latest || [])], [data]);
  const coverFor = (slug: string) => products.find((p) => p.category === slug)?.images?.[0];

  const headerBg = solidAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(11,10,9,0)', 'rgba(11,10,9,0.96)'] });
  const headerInk = solidAnim;

  if (error && !data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', paddingTop: insets.top }}>
        <ErrorState message={error} onRetry={reload} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Floating brand bar that settles onto linen as you scroll past the hero */}
      <Animated.View style={[st.topBar, { paddingTop: insets.top + 4, backgroundColor: headerBg }]}>
        <View style={{ width: 42 }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Animated.Text style={[st.wordmarkLight, { opacity: solidAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>VCHUKI</Animated.Text>
          <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', opacity: headerInk }]}>
            <T style={[st.wordmarkLight, { color: colors.ink }]}>VCHUKI</T>
          </Animated.View>
        </View>
        <IconBtn label="Search" onPress={() => router.push({ pathname: '/(tabs)/shop', params: { focus: '1' } })} style={{ backgroundColor: colors.glass }}>
          <Search size={19} color={colors.ink} strokeWidth={1.7} />
        </IconBtn>
      </Animated.View>

      <Animated.ScrollView
        onScroll={(e) => {
          const next = e.nativeEvent.contentOffset.y > HERO_H - 110;
          if (next !== solid) setSolid(next);
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_SPACE }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} progressViewOffset={insets.top + 40} />}>
        <Hero videoUrl={data?.heroVideos?.[0]?.url} poster={data?.featured?.[0]?.images?.[0] || data?.latest?.[0]?.images?.[0]} />

        <Announcements items={data?.config?.announcements} />

        {/* Categories */}
        <Section eyebrow="Shop by style" title="The collection">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 12 }}>
            {CATEGORIES.map((c) => (
              <Tap key={c.slug} onPress={() => router.push({ pathname: '/(tabs)/shop', params: { category: c.slug } })} style={st.catTile}>
                {coverFor(c.slug) ? (
                  <Image source={{ uri: img(coverFor(c.slug)) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.sand }]} />
                )}
                <LinearGradient colors={['transparent', 'rgba(26,20,14,0.78)']} style={StyleSheet.absoluteFill} />
                <View style={{ position: 'absolute', left: 14, right: 14, bottom: 14 }}>
                  <T v="caption" style={{ color: 'rgba(245,230,211,0.8)', letterSpacing: 0.4 }}>
                    {c.tagline}
                  </T>
                  <T style={{ fontFamily: fonts.display, fontSize: 19, color: colors.nightText, marginTop: 2 }}>{c.short}</T>
                </View>
              </Tap>
            ))}
          </ScrollView>
        </Section>

        {/* Featured rail */}
        <Section eyebrow="Most loved" title="Bestsellers" action="View all" onAction={() => router.push('/(tabs)/shop')}>
          <Rail products={data?.featured?.length ? data.featured : data?.latest} loading={loading} />
        </Section>

        {/* Combo offers */}
        {!!data?.comboOffers?.length && (
          <Section eyebrow="Better together" title="Bundle & save">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 12 }}>
              {data.comboOffers.map((o) => (
                <View key={o._id} style={st.offer}>
                  <T style={{ fontFamily: fonts.display, fontSize: 40, color: colors.accent, lineHeight: 44 }}>{o.discount}%</T>
                  <T v="eyebrow" style={{ color: colors.nightText, opacity: 0.6, marginTop: 2 }}>
                    off the set
                  </T>
                  <T style={{ fontFamily: fonts.semibold, fontSize: 15, color: colors.nightText, marginTop: 14 }}>{o.title}</T>
                  <T v="small" style={{ color: 'rgba(245,230,211,0.65)', marginTop: 4 }} numberOfLines={3}>
                    {o.description}
                  </T>
                </View>
              ))}
            </ScrollView>
            <T v="caption" style={{ paddingHorizontal: GUTTER, marginTop: 10 }}>
              Applied automatically in your bag.
            </T>
          </Section>
        )}

        {/* Story */}
        <View style={st.story}>
          <T v="eyebrow" style={{ color: colors.accent }}>
            Made in Jodhpur
          </T>
          <T style={{ fontFamily: fonts.display, fontSize: 28, lineHeight: 35, color: colors.nightText, marginTop: 10 }}>
            Breathable cotton-linen, <T style={{ fontFamily: fonts.displayItalic, fontSize: 28, color: colors.accent }}>cut for Indian summers.</T>
          </T>
          <T v="body" style={{ color: 'rgba(245,230,211,0.7)', marginTop: 12 }}>
            Every VCHUKI piece is stitched by karigars in Rajasthan, washed for softness and checked by hand before it ships to you.
          </T>
          <Button title="Our story" kind="accent" compact onPress={() => WebBrowser.openBrowserAsync(webUrl('/about'), { toolbarColor: colors.bg, controlsColor: colors.ink }).catch(() => {})} style={{ alignSelf: 'flex-start', marginTop: space.xl }} />
        </View>

        {/* New arrivals grid */}
        <Section eyebrow="Just in" title="New arrivals" action="Shop all" onAction={() => router.push('/(tabs)/shop')}>
          <ProductGrid products={(data?.latest || []).slice(0, 6)} loading={loading} />
        </Section>

        {/* Journal */}
        {!!data?.journal?.length && (
          <Section eyebrow="The journal" title="Notes on linen" action="Read more" onAction={() => router.push('/journal')}>
            <FlatList
              horizontal
              data={data.journal}
              keyExtractor={(b) => b._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 14 }}
              renderItem={({ item }) => (
                <Tap onPress={() => router.push({ pathname: '/journal/[slug]', params: { slug: item.slug } })} style={{ width: W * 0.68 }}>
                  <View style={{ height: W * 0.44, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.sand }}>
                    {!!item.coverImage && <Image source={{ uri: img(item.coverImage) }} style={StyleSheet.absoluteFill} contentFit="cover" />}
                  </View>
                  <T v="caption" style={{ marginTop: 10 }}>
                    {item.category} · {item.readTime}
                  </T>
                  <T v="h3" numberOfLines={2} style={{ marginTop: 4, fontSize: 17 }}>
                    {item.title}
                  </T>
                </Tap>
              )}
            />
          </Section>
        )}

        {/* VIP list — same as the website's newsletter block */}
        <View style={st.vip}>
          <T v="eyebrow" style={{ color: colors.accent }}>
            The VIP list
          </T>
          <T style={{ fontFamily: fonts.display, fontSize: 24, color: colors.nightText, marginTop: 6 }}>First look at every drop</T>
          <T v="small" style={{ color: 'rgba(245,230,211,0.65)', marginTop: 6 }}>
            New colours, restocks and members-only offers. The first 100 get 10% off.
          </T>
          <VipForm source="app-home" dark />
        </View>

        <TrustStrip />
      </Animated.ScrollView>
      <WelcomeVip />
    </View>
  );
}

function Hero({ videoUrl, poster }: { videoUrl?: string; poster?: string }) {
  const player = useVideoPlayer(videoUrl ? img(videoUrl)! : null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 900, delay: 150, useNativeDriver: true }).start();
  }, [fade]);

  return (
    <View style={{ height: HERO_H, backgroundColor: colors.night }}>
      {!!poster && <Image source={{ uri: img(poster) }} style={StyleSheet.absoluteFill} contentFit="cover" />}
      {!!videoUrl && <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />}
      <LinearGradient colors={['rgba(20,14,8,0.45)', 'rgba(20,14,8,0)', 'rgba(20,14,8,0.82)']} locations={[0, 0.35, 1]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[st.heroCopy, { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
        <T v="eyebrow" style={{ color: colors.nightText, opacity: 0.85 }}>
          Quiet luxury · Cotton-linen
        </T>
        <T style={{ fontFamily: fonts.display, fontSize: 42, lineHeight: 48, color: colors.nightText, marginTop: 10 }}>
          Linen that{'\n'}
          <T style={{ fontFamily: fonts.displayItalic, fontSize: 42, color: colors.nightText }}>breathes</T> with you.
        </T>
        <T v="body" style={{ color: 'rgba(245,230,211,0.78)', marginTop: 10 }}>
          Shirts and short kurtas from Jodhpur. Free shipping over ₹1,599.
        </T>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: space.xl }}>
          <Button title="Shop now" kind="accent" onPress={() => router.push('/(tabs)/shop')} icon={<ArrowRight size={17} color={colors.onAccent} />} style={{ flex: 1 }} />
        </View>
      </Animated.View>
    </View>
  );
}

function Announcements({ items }: { items?: string[] }) {
  const [i, setI] = useState(0);
  const o = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!items?.length) return;
    const id = setInterval(() => {
      Animated.timing(o, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        setI((n) => (n + 1) % items.length);
        Animated.timing(o, { toValue: 1, duration: 260, useNativeDriver: true }).start();
      });
    }, 3200);
    return () => clearInterval(id);
  }, [items, o]);
  if (!items?.length) return null;
  return (
    <View style={st.announce}>
      <Animated.View style={{ opacity: o }}>
        <T v="caption" style={{ color: colors.accentDeep, letterSpacing: 1.6, textAlign: 'center', fontFamily: fonts.medium }}>
          {items[i].toUpperCase()}
        </T>
      </Animated.View>
    </View>
  );
}

const CARD_W = W * 0.44;

function Rail({ products, loading }: { products?: Product[]; loading: boolean }) {
  if (loading && !products?.length) {
    return (
      <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: GUTTER }}>
        {[0, 1, 2].map((k) => (
          <Skeleton key={k} style={{ width: CARD_W, height: CARD_W * 1.3 + 50 }} />
        ))}
      </View>
    );
  }
  return (
    <FlatList
      horizontal
      data={products || []}
      keyExtractor={(p) => p._id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 14 }}
      renderItem={({ item }) => <ProductCard product={item} width={CARD_W} />}
    />
  );
}

function TrustStrip() {
  const items = [
    { Icon: Truck, title: 'Free shipping', body: 'On orders above ₹1,599' },
    { Icon: Wallet, title: 'Cash on delivery', body: 'Across India' },
    { Icon: RotateCcw, title: '7-day returns', body: 'Easy exchanges' },
    { Icon: BadgeCheck, title: 'Handcrafted', body: 'In Jodhpur, Rajasthan' },
  ];
  return (
    <View style={st.trust}>
      {items.map(({ Icon, title, body }) => (
        <View key={title} style={st.trustItem}>
          <Icon size={20} color={colors.accentDeep} strokeWidth={1.5} />
          <T v="title" style={{ fontSize: 13.5, marginTop: 8 }}>
            {title}
          </T>
          <T v="caption">{body}</T>
        </View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  topBar: { position: 'absolute', zIndex: 20, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 8 },
  wordmarkLight: { fontFamily: fonts.display, fontSize: 21, letterSpacing: 7, color: colors.nightText },
  heroCopy: { position: 'absolute', left: GUTTER, right: GUTTER, bottom: 32 },
  announce: { backgroundColor: colors.bg, paddingVertical: 12, paddingHorizontal: GUTTER, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.goldLine },
  catTile: { width: W * 0.4, height: W * 0.54, borderRadius: radius.lg, overflow: 'hidden' },
  offer: { width: W * 0.62, backgroundColor: colors.night, borderRadius: radius.lg, padding: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.goldLine },
  story: { marginTop: space.xxxl, marginHorizontal: GUTTER, backgroundColor: colors.night, borderRadius: radius.xl, padding: 26, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.goldLine },
  vip: { marginTop: space.xxxl, marginHorizontal: GUTTER, backgroundColor: colors.night, borderRadius: radius.xl, padding: 24, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.goldLine },
  trust: { flexDirection: 'row', flexWrap: 'wrap', marginTop: space.xxxl, marginHorizontal: GUTTER, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.line, paddingTop: space.xl },
  trustItem: { width: '50%', paddingVertical: 12, paddingRight: 10 },
});
