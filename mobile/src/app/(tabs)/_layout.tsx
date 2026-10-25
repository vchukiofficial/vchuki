import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router/tabs';
import { Heart, Home, LayoutGrid, ShoppingBag, User } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '@/components/ui';
import { useCartCount } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import { colors, fonts } from '@/theme';

const ICONS = { index: Home, shop: LayoutGrid, wishlist: Heart, bag: ShoppingBag, account: User } as const;
const LABELS = { index: 'Home', shop: 'Shop', wishlist: 'Saved', bag: 'Bag', account: 'Account' } as const;

function TabBar({ state, emitter, navigateToTab }: any) {
  const insets = useSafeAreaInsets();
  const bag = useCartCount();
  const saved = useWishlist((s) => s.ids.length);

  return (
    <View style={[st.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bar }]} />
      )}
      <View style={st.hair} />
      <View style={st.row}>
        {state.routes.map((route: any, index: number) => {
          const name = route.name as keyof typeof ICONS;
          const Icon = ICONS[name];
          if (!Icon) return null;
          const focused = state.index === index;
          const count = name === 'bag' ? bag : name === 'wishlist' ? saved : 0;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={count ? `${LABELS[name]}, ${count} items` : LABELS[name]}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                const e = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !e.defaultPrevented) navigateToTab(route.key);
              }}
              style={st.tab}>
              <View>
                <Icon size={22} strokeWidth={focused ? 1.5 : 1.15} color={focused ? colors.ink : colors.faint} />
                {count > 0 && (
                  <View style={[st.badge, name === 'wishlist' && { backgroundColor: colors.ink }]}>
                    <T v="caption" style={{ color: name === 'wishlist' ? colors.onInk : colors.onAccent, fontSize: 9.5, fontFamily: fonts.bold, lineHeight: 12 }}>
                      {count > 9 ? '9+' : count}
                    </T>
                  </View>
                )}
              </View>
              <T v="caption" style={{ marginTop: 3, fontSize: 10.5, color: focused ? colors.ink : colors.faint, fontFamily: focused ? fonts.semibold : fonts.medium }}>
                {LABELS[name]}
              </T>
              {focused && <View style={st.dot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs backBehavior="history" tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="shop" />
      <Tabs.Screen name="wishlist" />
      <Tabs.Screen name="bag" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

const st = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  hair: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  row: { flexDirection: 'row', paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, marginTop: 3 },
});
