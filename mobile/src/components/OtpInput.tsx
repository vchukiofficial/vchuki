import { type ComponentRef, useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, radius } from '@/theme';
import { T } from './ui';

/** 4-digit code entry: one hidden input, four visible boxes. Supports SMS/email autofill and paste. */
export function OtpInput({ value, onChange, length = 4, error }: { value: string; onChange: (v: string) => void; length?: number; error?: boolean }) {
  const ref = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <Pressable onPress={() => ref.current?.focus()} accessibilityLabel="Verification code">
      <View style={st.row}>
        {Array.from({ length }).map((_, i) => {
          const active = i === Math.min(value.length, length - 1);
          return (
            <View key={i} style={[st.box, active && { borderColor: colors.ink, borderWidth: 1.5 }, error && { borderColor: colors.danger }]}>
              <T style={st.digit}>{value[i] || ''}</T>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus
        maxLength={length}
        style={st.hidden}
      />
    </Pressable>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  box: { width: 58, height: 66, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  digit: { fontFamily: fonts.semibold, fontSize: 26, color: colors.ink },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
