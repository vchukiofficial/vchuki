import * as Haptics from 'expo-haptics';
import { Delete, Fingerprint, ScanFace } from 'lucide-react-native';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import type { BioKind } from '@/store/security';
import { colors, fonts } from '@/theme';
import { T } from './ui';

export interface PinPadHandle {
  shake: () => void;
}

/** Bank-style 4-digit keypad. Dark by default (lock screen); pass light for sheets. */
export const PinPad = forwardRef<PinPadHandle, { value: string; onChange: (v: string) => void; length?: number; bioKind?: BioKind; onBio?: () => void; light?: boolean }>(
  function PinPad({ value, onChange, length = 4, bioKind, onBio, light }, ref) {
    const x = useRef(new Animated.Value(0)).current;
    useImperativeHandle(ref, () => ({
      shake: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        Animated.sequence([12, -12, 9, -9, 5, 0].map((v) => Animated.timing(x, { toValue: v, duration: 45, useNativeDriver: true }))).start();
      },
    }));
    const fg = light ? colors.ink : colors.nightText;
    const keyBg = light ? colors.surface : 'rgba(245,230,211,0.07)';

    const press = (d: string) => {
      if (value.length >= length) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onChange(value + d);
    };

    const BioIcon = bioKind === 'face' ? ScanFace : Fingerprint;

    return (
      <View style={{ alignItems: 'center' }}>
        <Animated.View style={[st.dots, { transform: [{ translateX: x }] }]} accessibilityLabel={`${value.length} of ${length} digits entered`}>
          {Array.from({ length }).map((_, i) => (
            <View key={i} style={[st.dot, { borderColor: light ? colors.ink : colors.accent }, i < value.length && { backgroundColor: light ? colors.ink : colors.accent }]} />
          ))}
        </Animated.View>
        <View style={st.grid}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <Key key={d} label={d} onPress={() => press(d)} fg={fg} bg={keyBg} />
          ))}
          {bioKind && onBio ? (
            <Pressable onPress={onBio} style={st.key} accessibilityLabel="Use biometrics">
              <BioIcon size={28} color={light ? colors.accentDeep : colors.accent} strokeWidth={1.5} />
            </Pressable>
          ) : (
            <View style={st.key} />
          )}
          <Key label="0" onPress={() => press('0')} fg={fg} bg={keyBg} />
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(value.slice(0, -1));
            }}
            onLongPress={() => onChange('')}
            style={st.key}
            accessibilityLabel="Delete">
            <Delete size={24} color={fg} strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>
    );
  },
);

function Key({ label, onPress, fg, bg }: { label: string; onPress: () => void; fg: string; bg: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [st.key, { backgroundColor: pressed ? 'rgba(196,149,106,0.35)' : bg }]} accessibilityLabel={label}>
      <T style={{ fontFamily: fonts.display, fontSize: 30, color: fg }}>{label}</T>
    </Pressable>
  );
}

const st = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 18, marginBottom: 34 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5 },
  grid: { width: 300, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  key: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
});
