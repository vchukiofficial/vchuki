import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, GUTTER, radius } from '@/theme';
import { IconBtn, T, Tap } from './ui';

/**
 * VCHUKI Studio — the admin side of the app. Dark espresso header, linen body,
 * so staff always know they're editing the live store.
 */

export function StudioHeader({ title, subtitle, right, back = true }: { title: string; subtitle?: string; right?: ReactNode; back?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[st.header, { paddingTop: insets.top + 6 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {back ? (
          <IconBtn label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/admin'))} style={{ backgroundColor: 'rgba(245,230,211,0.1)', marginRight: 10 }}>
            <ChevronLeft size={21} color={colors.nightText} strokeWidth={1.7} />
          </IconBtn>
        ) : null}
        <View style={{ flex: 1 }}>
          <T v="eyebrow" style={{ color: colors.accent, fontSize: 9.5 }}>
            VCHUKI Studio
          </T>
          <T numberOfLines={1} style={{ fontFamily: fonts.display, fontSize: 23, color: colors.nightText, marginTop: 2 }}>
            {title}
          </T>
          {!!subtitle && (
            <T v="caption" style={{ color: 'rgba(245,230,211,0.6)', marginTop: 2 }} numberOfLines={1}>
              {subtitle}
            </T>
          )}
        </View>
        {right}
      </View>
    </View>
  );
}

export function HeaderAction({ icon, label, onPress }: { icon: ReactNode; label: string; onPress: () => void }) {
  return (
    <IconBtn label={label} onPress={onPress} style={{ backgroundColor: colors.accent, marginLeft: 8 }}>
      {icon}
    </IconBtn>
  );
}

export function StatTile({ label, value, hint, tone, onPress, wide }: { label: string; value: string; hint?: string; tone?: 'good' | 'bad' | 'warn'; onPress?: () => void; wide?: boolean }) {
  const hintColor = tone === 'good' ? colors.success : tone === 'bad' ? colors.danger : tone === 'warn' ? colors.warning : colors.muted;
  return (
    <Tap onPress={onPress} disabled={!onPress} haptic={!!onPress} style={[st.tile, wide && { width: '100%' }]}>
      <T v="caption" style={{ letterSpacing: 0.6, textTransform: 'uppercase', fontSize: 10 }}>
        {label}
      </T>
      <T style={{ fontFamily: fonts.semibold, fontSize: 22, color: colors.ink, marginTop: 6, fontVariant: ['tabular-nums'] }}>{value}</T>
      {!!hint && (
        <T v="caption" style={{ color: hintColor, marginTop: 2, fontFamily: fonts.medium }}>
          {hint}
        </T>
      )}
    </Tap>
  );
}

export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={st.search}>
      <Search size={17} color={colors.muted} strokeWidth={1.7} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        style={st.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        selectionColor={colors.accent}
      />
      {!!value && (
        <Tap onPress={() => onChange('')} hitSlop={10} accessibilityLabel="Clear">
          <X size={16} color={colors.muted} />
        </Tap>
      )}
    </View>
  );
}

export function Segments<K extends string>({ items, value, onChange }: { items: { key: K; label: string; count?: number }[]; value: K; onChange: (k: K) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: GUTTER, paddingVertical: 12 }}>
      {items.map((i) => {
        const on = i.key === value;
        return (
          <Tap key={i.key} onPress={() => onChange(i.key)} style={[st.seg, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
            <T v="caption" style={{ color: on ? colors.onInk : colors.ink, fontFamily: fonts.semibold, fontSize: 12.5 }}>
              {i.label}
            </T>
            {i.count !== undefined && (
              <View style={[st.segCount, on && { backgroundColor: colors.accent }]}>
                <T v="caption" style={{ fontSize: 10, color: on ? colors.onAccent : colors.ink, fontFamily: fonts.bold }}>
                  {i.count}
                </T>
              </View>
            )}
          </Tap>
        );
      })}
    </ScrollView>
  );
}

export function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={st.toggle}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <T v="title" style={{ fontSize: 14 }}>
          {label}
        </T>
        {!!hint && <T v="caption">{hint}</T>}
      </View>
      <Switch
        value={value}
        onValueChange={(v) => {
          Haptics.selectionAsync().catch(() => {});
          onChange(v);
        }}
        trackColor={{ true: colors.accent, false: colors.line }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.line}
      />
    </View>
  );
}

export function SectionLabel({ children, style }: { children: ReactNode; style?: object }) {
  return (
    <T v="caption" style={[{ letterSpacing: 1, textTransform: 'uppercase', marginTop: 24, marginBottom: 8, marginLeft: 2 }, style]}>
      {children}
    </T>
  );
}

/** Two-button destructive confirm. */
export function confirm(title: string, message: string, action: string, onOk: () => void, destructive = true) {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: action, style: destructive ? 'destructive' : 'default', onPress: onOk },
  ]);
}

export const fmtDateTime = (d?: string | Date) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—';

export const inr = (n: number) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

const st = StyleSheet.create({
  header: { backgroundColor: colors.night, paddingHorizontal: GUTTER, paddingBottom: 16, borderBottomLeftRadius: 22, borderBottomRightRadius: 22, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.goldLine },
  tile: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  search: {
    height: 46,
    marginHorizontal: GUTTER,
    marginTop: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14.5, color: colors.ink, height: 46 },
  seg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  segCount: { minWidth: 20, height: 18, borderRadius: 9, paddingHorizontal: 5, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  toggle: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
});
