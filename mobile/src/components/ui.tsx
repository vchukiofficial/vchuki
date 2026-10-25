import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ChevronLeft, Star } from 'lucide-react-native';
import { type ComponentRef, forwardRef, type ReactNode, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, GUTTER, radius, space } from '@/theme';

/* ───────────────────────── Typography ───────────────────────── */

type Variant = 'hero' | 'h1' | 'h2' | 'h3' | 'title' | 'body' | 'small' | 'caption' | 'eyebrow' | 'price' | 'button';

const variants: Record<Variant, TextStyle> = {
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: -0.5, color: colors.ink },
  h1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.3, color: colors.ink },
  h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, color: colors.ink },
  h3: { fontFamily: fonts.display, fontSize: 19, lineHeight: 25, color: colors.ink },
  title: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.inkSoft },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.muted },
  caption: { fontFamily: fonts.medium, fontSize: 11.5, lineHeight: 16, color: colors.muted },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: 2.2, textTransform: 'uppercase', color: colors.accentDeep },
  price: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink, fontVariant: ['tabular-nums'] },
  button: { fontFamily: fonts.semibold, fontSize: 14, letterSpacing: 1.2, textTransform: 'uppercase' },
};

/**
 * When a caller changes fontSize but not lineHeight, the variant's lineHeight no longer fits:
 * bigger text gets its top/bottom clipped on Android (PIN digits, prices), smaller text gets
 * extra empty space. Re-derive lineHeight from the size actually used.
 */
function fitLineHeight(base: TextStyle, override: TextStyle): TextStyle | null {
  if (override.fontSize == null || override.lineHeight != null || base.lineHeight == null) return null;
  const display = String(override.fontFamily ?? base.fontFamily ?? '').startsWith('PlayfairDisplay');
  return { lineHeight: Math.ceil(override.fontSize * (display ? 1.25 : 1.4)) };
}

export function T({ v = 'body', style, ...p }: TextProps & { v?: Variant }) {
  const base = variants[v];
  const fit = style ? fitLineHeight(base, (StyleSheet.flatten(style) || {}) as TextStyle) : null;
  return <Text {...p} style={[base, style, fit]} maxFontSizeMultiplier={1.4} />;
}

/* ───────────────────────── Pressable with feedback ───────────────────────── */

export function Tap({ style, haptic = true, onPress, ...p }: Omit<PressableProps, 'style'> & { haptic?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      {...p}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
      style={({ pressed }) => [{ opacity: pressed ? 0.72 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }, style]}
    />
  );
}

/* ───────────────────────── Buttons ───────────────────────── */

type BtnKind = 'primary' | 'accent' | 'outline' | 'ghost';

export function Button({
  title,
  onPress,
  kind = 'primary',
  loading,
  disabled,
  icon,
  style,
  compact,
}: {
  title: string;
  onPress?: () => void;
  kind?: BtnKind;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
  compact?: boolean;
}) {
  const bg = { primary: colors.ink, accent: colors.accent, outline: 'transparent', ghost: 'transparent' }[kind];
  const fg = { primary: colors.onInk, accent: colors.onAccent, outline: colors.ink, ghost: colors.ink }[kind];
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={off}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [
        s.btn,
        compact && { height: 44, paddingHorizontal: 18 },
        { backgroundColor: bg, opacity: off ? 0.45 : pressed ? 0.85 : 1 },
        kind === 'outline' && { borderWidth: 1, borderColor: colors.ink },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon}
          <T v="button" style={{ color: fg, fontSize: compact ? 12.5 : 14 }}>
            {title}
          </T>
        </>
      )}
    </Pressable>
  );
}

export function IconBtn({ children, onPress, label, style }: { children: ReactNode; onPress?: () => void; label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Tap accessibilityLabel={label} accessibilityRole="button" onPress={onPress} hitSlop={8} style={[s.iconBtn, style]}>
      {children}
    </Tap>
  );
}

/* ───────────────────────── Inputs ───────────────────────── */

export const Field = forwardRef<ComponentRef<typeof TextInput>, TextInputProps & { label: string; error?: string | null; right?: ReactNode }>(
  function Field({ label, error, right, style, ...p }, ref) {
    return (
      <View style={{ marginBottom: space.md }}>
        <T v="caption" style={{ marginBottom: 6, color: colors.inkSoft }}>
          {label}
        </T>
        <View style={[s.field, !!error && { borderColor: colors.danger }]}>
          <TextInput
            ref={ref}
            placeholderTextColor={colors.faint}
            selectionColor={colors.accent}
            {...p}
            style={[s.input, style]}
          />
          {right}
        </View>
        {!!error && (
          <T v="caption" style={{ color: colors.danger, marginTop: 4 }}>
            {error}
          </T>
        )}
      </View>
    );
  },
);

/* ───────────────────────── Layout bits ───────────────────────── */

export function Header({ title, right, back = true, transparent }: { title?: string; right?: ReactNode; back?: boolean; transparent?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.header, { paddingTop: insets.top + 6 }, !transparent && { backgroundColor: colors.bg }]}>
      <View style={{ width: 44 }}>
        {back && (
          <IconBtn label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
            <ChevronLeft size={22} color={colors.ink} strokeWidth={1.6} />
          </IconBtn>
        )}
      </View>
      <T v="title" numberOfLines={1} style={{ flex: 1, textAlign: 'center', fontFamily: fonts.display, fontSize: 18 }}>
        {title}
      </T>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function Section({ eyebrow, title, action, onAction, children, style }: { eyebrow?: string; title: string; action?: string; onAction?: () => void; children?: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{ marginTop: space.xxxl }, style]}>
      <View style={s.sectionHead}>
        <View style={{ flex: 1 }}>
          {!!eyebrow && <T v="eyebrow">{eyebrow}</T>}
          <T v="h2" style={{ marginTop: 4 }}>
            {title}
          </T>
        </View>
        {!!action && (
          <Tap onPress={onAction} hitSlop={10}>
            <T v="caption" style={{ color: colors.ink, textDecorationLine: 'underline' }}>
              {action}
            </T>
          </Tap>
        )}
      </View>
      {children}
    </View>
  );
}

export const Divider = ({ style }: { style?: ViewStyle }) => <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.line }, style]} />;

export function Chip({ label, active, onPress, disabled, strike }: { label: string; active?: boolean; onPress?: () => void; disabled?: boolean; strike?: boolean }) {
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ selected: active, disabled }}
      style={[s.chip, active && { backgroundColor: colors.ink, borderColor: colors.ink }, disabled && { opacity: 0.4 }]}>
      <T
        v="caption"
        style={[
          { color: active ? colors.onInk : colors.ink, fontFamily: fonts.semibold, fontSize: 12.5, letterSpacing: 0.4 },
          strike && { textDecorationLine: 'line-through' },
        ]}>
        {label}
      </T>
    </Tap>
  );
}

export function Pill({ children, tone = 'accent' }: { children: ReactNode; tone?: 'accent' | 'success' | 'warning' | 'danger' | 'dark' }) {
  const map = {
    accent: [colors.accentWash, colors.accentDeep],
    success: [colors.successWash, colors.success],
    warning: [colors.warningWash, colors.warning],
    danger: [colors.dangerWash, colors.danger],
    dark: [colors.night, colors.nightText],
  }[tone];
  return (
    <View style={{ backgroundColor: map[0], paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' }}>
      <T v="caption" style={{ color: map[1], fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: 0.6 }}>
        {children}
      </T>
    </View>
  );
}

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} color={colors.accent} fill={i <= Math.round(value) ? colors.accent : 'transparent'} strokeWidth={1.5} />
      ))}
    </View>
  );
}

export function Empty({ icon, title, body, action, onAction }: { icon: ReactNode; title: string; body?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: 36, paddingVertical: 64 }}>
      <View style={s.emptyIcon}>{icon}</View>
      <T v="h2" style={{ textAlign: 'center', marginTop: space.xl }}>
        {title}
      </T>
      {!!body && (
        <T v="small" style={{ textAlign: 'center', marginTop: space.sm }}>
          {body}
        </T>
      )}
      {!!action && <Button title={action} onPress={onAction} style={{ marginTop: space.xxl, alignSelf: 'stretch' }} />}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={{ padding: GUTTER * 2, alignItems: 'center' }}>
      <T v="h3" style={{ textAlign: 'center' }}>
        Couldn’t load this
      </T>
      <T v="small" style={{ textAlign: 'center', marginTop: 6 }}>
        {message}
      </T>
      {onRetry && <Button title="Try again" kind="outline" compact onPress={onRetry} style={{ marginTop: space.xl }} />}
    </View>
  );
}

/** Shimmering placeholder block. */
export function Skeleton({ style }: { style?: ViewStyle }) {
  const o = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(o, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(o, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [o]);
  return <Animated.View style={[{ backgroundColor: colors.sand, borderRadius: radius.md, opacity: o }, style]} />;
}

export function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: 'success' }) {
  return (
    <View style={s.row}>
      <T v={strong ? 'title' : 'small'} style={strong ? undefined : { color: colors.inkSoft }}>
        {label}
      </T>
      <T v={strong ? 'price' : 'small'} style={[{ color: tone === 'success' ? colors.success : strong ? colors.ink : colors.inkSoft, fontVariant: ['tabular-nums'] }, strong && { fontSize: 18 }]}>
        {value}
      </T>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

const s = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: radius.pill,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  input: { flex: 1, height: 50, fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 8,
    zIndex: 10,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: GUTTER, marginBottom: space.lg },
  chip: {
    minWidth: 52,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accentWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
});
