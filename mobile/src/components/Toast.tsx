import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { colors, fonts } from '@/theme';

/** Small bottom toast ("Link copied", "Press back again to exit"). */
const useToast = create<{ msg: string | null; id: number }>(() => ({ msg: null, id: 0 }));
export const toast = (msg: string) => useToast.setState((s) => ({ msg, id: s.id + 1 }));

export function Toast() {
  const { msg, id } = useToast();
  const insets = useSafeAreaInsets();
  const o = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!msg) return;
    o.setValue(0);
    Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(o, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(({ finished }) => finished && useToast.setState({ msg: null }));
  }, [id, msg, o]);

  if (!msg) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[st.toast, { bottom: insets.bottom + 110, opacity: o, transform: [{ translateY: o.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
      <Animated.Text style={st.text}>{msg}</Animated.Text>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  toast: { position: 'absolute', alignSelf: 'center', backgroundColor: colors.night, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999, zIndex: 1000 },
  text: { color: colors.nightText, fontFamily: fonts.medium, fontSize: 13.5 },
});
