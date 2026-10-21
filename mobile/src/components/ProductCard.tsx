import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { img } from '@/lib/api';
import { openProductActions } from './ProductActions';
import { percentOff, rupee } from '@/lib/pricing';
import type { Product } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { useWishlist } from '@/store/wishlist';
import { colors, fonts, radius } from '@/theme';
import { T } from './ui';

export function ProductCard({ product, width }: { product: Product; width: number }) {
  const signedIn = useAuth((s) => !!s.token);
  const saved = useWishlist((s) => s.ids.includes(product._id));
  const toggle = useWishlist((s) => s.toggle);
  const off = percentOff(product.basePrice, product.comparePrice);
  const second = product.images?.[1];

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${product.name}, ${rupee(product.basePrice)}`}
      onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: product.slug } })}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        openProductActions(product);
      }}
      delayLongPress={350}
      accessibilityHint="Long-press to share"
      style={({ pressed }) => [{ width, opacity: pressed ? 0.9 : 1 }]}>
      <View style={[st.imageWell, { height: width * 1.3 }]}>
        <Image
          source={{ uri: img(product.images?.[0]) }}
          placeholder={second ? { uri: img(second) } : undefined}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          recyclingKey={product._id}
        />
        {off > 0 && (
          <View style={st.badge}>
            <T v="caption" style={{ color: colors.nightText, fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 0.8 }}>
              {off}% OFF
            </T>
          </View>
        )}
        <Pressable
          accessibilityLabel={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          hitSlop={8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            toggle(product._id, signedIn);
          }}
          style={st.heart}>
          <Heart size={17} strokeWidth={1.7} color={saved ? colors.danger : colors.ink} fill={saved ? colors.danger : 'transparent'} />
        </Pressable>
      </View>
      <T v="small" numberOfLines={2} style={{ color: colors.ink, marginTop: 10, fontFamily: fonts.medium, lineHeight: 18 }}>
        {product.name}
      </T>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
        <T v="price" style={{ fontSize: 14.5 }}>
          {rupee(product.basePrice)}
        </T>
        {!!product.comparePrice && product.comparePrice > product.basePrice && (
          <T v="caption" style={{ textDecorationLine: 'line-through', color: colors.faint }}>
            {rupee(product.comparePrice)}
          </T>
        )}
      </View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  imageWell: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.sand },
  badge: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: colors.night,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  heart: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
