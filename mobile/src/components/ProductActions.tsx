import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Download, Heart, Image as ImageIcon, Link2, Send, ShoppingBag } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { create } from 'zustand';
import { img } from '@/lib/api';
import { rupee } from '@/lib/pricing';
import { copyLink, savePhotos, shareLink, sharePhoto } from '@/lib/share';
import type { Product } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { useWishlist } from '@/store/wishlist';
import { colors, fonts, radius } from '@/theme';
import { Sheet } from './Sheet';
import { T, Tap } from './ui';

/**
 * One share/quick-actions sheet for the whole app. Open it from any product card
 * (long-press), the product page share button, or a photo in the gallery.
 */
type Target = { product: Product; image?: string; images?: string[] } | null;
const useActions = create<{ target: Target }>(() => ({ target: null }));
export const openProductActions = (product: Product, image?: string, images?: string[]) => useActions.setState({ target: { product, image, images } });

export function ProductActionsHost() {
  const target = useActions((s) => s.target);
  const signedIn = useAuth((s) => !!s.token);
  const saved = useWishlist((s) => (target ? s.ids.includes(target.product._id) : false));
  const toggle = useWishlist((s) => s.toggle);
  const close = () => useActions.setState({ target: null });
  if (!target) return null;
  const { product: p } = target;
  const photos = target.images?.length ? target.images : p.images || [];
  const photo = target.image || photos[0];

  const run = (fn: () => unknown) => () => {
    close();
    setTimeout(fn, 320);
  };

  const actions: { Icon: ComponentType<any>; label: string; onPress: () => void }[] = [
    { Icon: Send, label: 'Share photo', onPress: run(() => sharePhoto(p, photo)) },
    { Icon: Link2, label: 'Share link', onPress: run(() => shareLink(p)) },
    { Icon: Download, label: `Save ${photos.length > 1 ? `${photos.length} photos` : 'photo'}`, onPress: run(() => savePhotos(p, photos)) },
    { Icon: ImageIcon, label: 'Copy link', onPress: run(() => copyLink(p)) },
    { Icon: Heart, label: saved ? 'Saved ✓' : 'Save to wishlist', onPress: () => toggle(p._id, signedIn) },
    { Icon: ShoppingBag, label: 'View product', onPress: run(() => router.push({ pathname: '/product/[slug]', params: { slug: p.slug } })) },
  ];

  return (
    <Sheet open onClose={close} title="Share">
      <View style={st.head}>
        <Image source={{ uri: img(photo) }} style={st.thumb} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <T v="title" numberOfLines={2} style={{ fontSize: 14 }}>
            {p.name}
          </T>
          <T v="caption" style={{ marginTop: 2 }}>
            {rupee(p.basePrice)}
          </T>
        </View>
      </View>
      {photos.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14 }}>
          {photos.map((u, i) => (
            <Tap key={`${u}-${i}`} onPress={run(() => sharePhoto(p, u))} accessibilityLabel={`Share photo ${i + 1}`}>
              <Image source={{ uri: img(u) }} style={[st.mini, u === photo && { borderColor: colors.accent }]} contentFit="cover" />
            </Tap>
          ))}
        </ScrollView>
      )}
      <View style={st.grid}>
        {actions.map(({ Icon, label, onPress }) => (
          <Tap key={label} onPress={onPress} style={st.action}>
            <View style={st.icon}>
              <Icon size={20} color={colors.ink} strokeWidth={1.6} />
            </View>
            <T v="caption" style={{ color: colors.ink, fontFamily: fonts.medium, textAlign: 'center', marginTop: 6 }} numberOfLines={2}>
              {label}
            </T>
          </Tap>
        ))}
      </View>
      <View style={{ height: 14 }} />
    </Sheet>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 14 },
  thumb: { width: 52, height: 64, borderRadius: radius.sm, backgroundColor: colors.sand },
  mini: { width: 64, height: 80, borderRadius: radius.sm, backgroundColor: colors.sand, borderWidth: 2, borderColor: 'transparent' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
  action: { width: '33.33%', alignItems: 'center' },
  icon: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
});
