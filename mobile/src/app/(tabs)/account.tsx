import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { BookOpen, ChevronRight, FileText, AtSign, Heart, LogOut, Mail, MapPin, Package, Phone, ShieldCheck, UserRound, KeyRound, Headphones } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, T, Tap } from '@/components/ui';
import { webUrl } from '@/lib/api';
import { POLICY_PAGES } from '@/lib/catalog';
import { useAuth } from '@/store/auth';
import { useConfig } from '@/store/config';
import { useSecurity } from '@/store/security';
import { colors, fonts, GUTTER, radius, space, TAB_SPACE } from '@/theme';

export default function Account() {
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const token = useAuth((s) => s.token);
  const signOut = useAuth((s) => s.signOut);
  const cfg = useConfig((s) => s.config);
  const hasPin = useSecurity((s) => s.hasPin);

  const open = (path: string) => WebBrowser.openBrowserAsync(webUrl(path), { toolbarColor: colors.bg, controlsColor: colors.ink }).catch(() => {});

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: GUTTER, paddingBottom: TAB_SPACE }}>
      <T v="eyebrow">Account</T>
      {token && user ? (
        <View style={st.profile}>
          <View style={st.avatar}>
            <T style={{ fontFamily: fonts.display, fontSize: 24, color: colors.nightText }}>{user.name?.[0]?.toUpperCase() || 'V'}</T>
          </View>
          <View style={{ flex: 1 }}>
            <T v="h2">{user.name}</T>
            <T v="small">{user.email}</T>
          </View>
        </View>
      ) : (
        <View style={{ marginTop: 6 }}>
          <T v="h1">Hello there</T>
          <T v="body" style={{ marginTop: 6 }}>
            Sign in to track orders, save addresses and keep your wishlist on every device.
          </T>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: space.xl }}>
            <Button title="Sign in" onPress={() => router.push('/auth/login')} style={{ flex: 1 }} />
            <Button title="Join" kind="outline" onPress={() => router.push('/auth/register')} style={{ flex: 1 }} />
          </View>
          <Tap onPress={() => router.push({ pathname: '/auth/login', params: { staff: '1' } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 16 }} hitSlop={8}>
            <ShieldCheck size={14} color={colors.accentDeep} />
            <T v="caption" style={{ color: colors.accentDeep, fontFamily: fonts.semibold }}>
              VCHUKI team? Staff sign in
            </T>
          </Tap>
        </View>
      )}

      {user?.role === 'admin' && (
        <Tap onPress={() => router.push('/admin')} style={st.studio}>
          <View style={st.studioIcon}>
            <ShieldCheck size={20} color={colors.night} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <T v="eyebrow" style={{ color: colors.accent }}>
              Admin
            </T>
            <T style={{ fontFamily: fonts.display, fontSize: 20, color: colors.nightText, marginTop: 2 }}>VCHUKI Studio</T>
            <T v="caption" style={{ color: 'rgba(245,230,211,0.6)', marginTop: 2 }}>
              Orders, stock, products, counter, marketing
            </T>
          </View>
          <ChevronRight size={18} color={colors.accent} />
        </Tap>
      )}

      {token && (
        <Group title="Your VCHUKI">
          <Item icon={<Package size={19} color={colors.ink} strokeWidth={1.6} />} label="Orders & returns" onPress={() => router.push('/orders')} />
          <Item icon={<MapPin size={19} color={colors.ink} strokeWidth={1.6} />} label="Saved addresses" onPress={() => router.push('/addresses')} />
          <Item icon={<Heart size={19} color={colors.ink} strokeWidth={1.6} />} label="Wishlist" onPress={() => router.push('/(tabs)/wishlist')} />
          <Item icon={<UserRound size={19} color={colors.ink} strokeWidth={1.6} />} label="Profile" onPress={() => router.push('/profile')} />
          <Item icon={<KeyRound size={19} color={colors.ink} strokeWidth={1.6} />} label={hasPin ? 'Security · MPIN & fingerprint' : 'Set up MPIN & fingerprint'} onPress={() => router.push(hasPin ? '/security' : { pathname: '/security', params: { setup: '1' } })} last />
        </Group>
      )}

      <Group title="Discover">
        <Item icon={<BookOpen size={19} color={colors.ink} strokeWidth={1.6} />} label="The journal" onPress={() => router.push('/journal')} />
        <Item icon={<AtSign size={19} color={colors.ink} strokeWidth={1.6} />} label="Follow @vchukiofficial" onPress={() => Linking.openURL(cfg.instagram)} last />
      </Group>

      <Group title="Help">
        <Item icon={<Headphones size={19} color={colors.ink} strokeWidth={1.6} />} label="Contact us & WhatsApp" onPress={() => router.push('/contact')} />
        <Item icon={<Mail size={19} color={colors.ink} strokeWidth={1.6} />} label={cfg.supportEmail} onPress={() => Linking.openURL(`mailto:${cfg.supportEmail}`)} />
        <Item icon={<Phone size={19} color={colors.ink} strokeWidth={1.6} />} label={cfg.supportPhone} onPress={() => Linking.openURL(`tel:${cfg.supportPhone.replace(/\s/g, '')}`)} />
        {POLICY_PAGES.map((p, i) => (
          <Item key={p.path} icon={<FileText size={19} color={colors.ink} strokeWidth={1.6} />} label={p.title} onPress={() => open(p.path)} last={i === POLICY_PAGES.length - 1} />
        ))}
      </Group>

      {token && (
        <Tap
          onPress={() =>
            Alert.alert('Sign out?', 'Your bag stays on this phone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign out', style: 'destructive', onPress: signOut },
            ])
          }
          style={st.signOut}>
          <LogOut size={17} color={colors.danger} />
          <T v="title" style={{ color: colors.danger, fontSize: 14 }}>
            Sign out
          </T>
        </Tap>
      )}

      <T v="caption" style={{ textAlign: 'center', marginTop: space.xxl }}>
        VCHUKI · Handcrafted in Jodhpur
      </T>
    </ScrollView>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: space.xxl }}>
      <T v="caption" style={{ marginBottom: 8, marginLeft: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
        {title}
      </T>
      <Card style={{ paddingVertical: 4, paddingHorizontal: 0 }}>{children}</Card>
    </View>
  );
}

function Item({ icon, label, onPress, last }: { icon: ReactNode; label: string; onPress: () => void; last?: boolean }) {
  return (
    <Tap onPress={onPress} style={[st.item, !last && st.itemBorder]}>
      {icon}
      <T v="body" style={{ flex: 1, color: colors.ink, fontSize: 14.5 }}>
        {label}
      </T>
      <ChevronRight size={17} color={colors.faint} />
    </Tap>
  );
}

const st = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.night, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 15 },
  itemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  studio: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.night, borderRadius: radius.xl, padding: 18, marginTop: space.xl },
  studioIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: space.xxl, paddingVertical: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.dangerWash },
});
