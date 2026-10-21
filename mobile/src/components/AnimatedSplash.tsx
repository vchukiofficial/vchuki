import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, fonts } from '@/theme';

const LETTERS = 'VCHUKI'.split('');

/**
 * Picks up exactly where the native splash leaves off (same espresso + cream mark, same size),
 * then: the mark settles, the wordmark letters rise in one by one, a gold rule draws,
 * the tagline fades in — and the whole layer lifts away to reveal the app.
 */
export function AnimatedSplash({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const mark = useRef(new Animated.Value(0)).current;
  const letters = useRef(LETTERS.map(() => new Animated.Value(0))).current;
  const rule = useRef(new Animated.Value(0)).current;
  const tag = useRef(new Animated.Value(0)).current;
  const out = useRef(new Animated.Value(0)).current;
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    Animated.sequence([
      Animated.timing(mark, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.stagger(
        70,
        letters.map((v) => Animated.timing(v, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true })),
      ),
      Animated.parallel([
        Animated.timing(rule, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(tag, { toValue: 1, duration: 500, delay: 120, useNativeDriver: true }),
      ]),
      Animated.delay(350),
    ]).start(() => setIntroDone(true));
  }, [mark, letters, rule, tag]);

  // Leave only once the intro has played AND fonts/session are loaded
  useEffect(() => {
    if (!introDone || !ready) return;
    Animated.timing(out, { toValue: 1, duration: 520, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(onDone);
  }, [introDone, ready, out, onDone]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        st.wrap,
        { opacity: out.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [{ scale: out.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] },
      ]}>
      <Animated.View
        style={{
          transform: [
            { translateY: mark.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
            { scale: mark.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] }) },
          ],
        }}>
        <Image source={require('@/assets/images/logo-mark-light.png')} style={{ width: 110, height: 107 }} contentFit="contain" />
      </Animated.View>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        {LETTERS.map((l, i) => (
          <Animated.Text
            key={i}
            style={[
              st.letter,
              { opacity: letters[i], transform: [{ translateY: letters[i].interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] },
            ]}>
            {l}
          </Animated.Text>
        ))}
      </View>
      <Animated.View style={[st.rule, { transform: [{ scaleX: rule }] }]} />
      <Animated.Text style={[st.tag, { opacity: tag }]}>Linen · Crafted in Jodhpur</Animated.Text>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  wrap: { backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  letter: { fontFamily: fonts.display, fontSize: 34, letterSpacing: 10, color: colors.nightText, marginRight: -2 },
  rule: { width: 64, height: 1.5, backgroundColor: colors.accent, marginTop: 18 },
  tag: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 3.5, color: 'rgba(245,230,211,0.65)', textTransform: 'uppercase', marginTop: 14 },
});
