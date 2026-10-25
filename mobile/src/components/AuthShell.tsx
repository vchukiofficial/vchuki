import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import { type ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, GUTTER } from '@/theme';
import { IconBtn, T } from './ui';

/**
 * Sign-in / sign-up / reset frame: espresso header with the VCHUKI mark,
 * a linen sheet that rises over it with the form.
 */
export function AuthShell({ eyebrow, title, subtitle, children, back }: { eyebrow: string; title: string; subtitle?: string; children: ReactNode; back?: () => void }) {
  const insets = useSafeAreaInsets();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [a, title]);

  const close = () => (router.canDismiss() ? router.dismissAll() : router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.night }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={[st.top, { paddingTop: insets.top + 10 }]}>
          <View style={st.bar}>
            {back ? (
              <IconBtn label="Back" onPress={back} style={st.glass}>
                <ChevronLeft size={21} color={colors.nightText} />
              </IconBtn>
            ) : (
              <View style={{ width: 42 }} />
            )}
            <IconBtn label="Close" onPress={close} style={st.glass}>
              <X size={19} color={colors.nightText} />
            </IconBtn>
          </View>
          <Animated.View style={{ alignItems: 'center', opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }}>
            <Image source={require('@/assets/images/logo-mark-light.png')} style={{ width: 58, height: 56 }} contentFit="contain" />
            <T style={st.word}>VCHUKI</T>
          </Animated.View>
        </View>
        <Animated.View
          style={[
            st.sheet,
            { paddingBottom: insets.bottom + 28, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] },
          ]}>
          <T v="eyebrow">{eyebrow}</T>
          <T v="h1" style={{ marginTop: 6 }}>
            {title}
          </T>
          {!!subtitle && (
            <T v="small" style={{ marginTop: 6 }}>
              {subtitle}
            </T>
          )}
          <View style={{ marginTop: 24 }}>{children}</View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Password strength 0–4 for the sign-up and reset screens. */
export function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++;
  return p.length < 6 ? 0 : Math.max(1, s);
}

export function StrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const s = strength(password);
  const label = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'][s];
  const tone = [colors.danger, colors.danger, colors.warning, colors.success, colors.success][s];
  return (
    <View style={{ marginTop: -4, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= s ? tone : colors.line }} />
        ))}
      </View>
      <T v="caption" style={{ color: tone, marginTop: 4, fontFamily: fonts.semibold }}>
        {label}
      </T>
    </View>
  );
}

const st = StyleSheet.create({
  top: { paddingHorizontal: GUTTER, paddingBottom: 34, alignItems: 'stretch' },
  bar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  glass: { backgroundColor: 'rgba(245,230,211,0.1)' },
  word: { fontFamily: fonts.display, fontSize: 20, letterSpacing: 8, color: colors.nightText, marginTop: 10 },
  sheet: { flex: 1, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: GUTTER, paddingTop: 28, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.goldLine },
});
