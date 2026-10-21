import AsyncStorage from '@react-native-async-storage/async-storage';
import { Crown, Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { colors, fonts, radius } from '@/theme';
import { Button, T } from './ui';

/** Same /api/waitlist the website's newsletter block, VIP page and welcome pop-up use. */
export function useVipJoin() {
  const user = useAuth((s) => s.user);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ message: string; earlyAccess?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function join(source = 'app') {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email');
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ message: string; earlyAccess?: boolean }>('/api/waitlist', { method: 'POST', body: { email: email.trim().toLowerCase(), phone: phone.replace(/\D/g, '') || undefined, source }, auth: false });
      setResult(r);
      AsyncStorage.setItem('vchuki_vip_joined', '1').catch(() => {});
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return { email, setEmail, phone, setPhone, busy, result, error, join };
}

export function VipForm({ source = 'app', dark }: { source?: string; dark?: boolean }) {
  const v = useVipJoin();
  const fg = dark ? colors.nightText : colors.ink;
  if (v.result) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 8 }}>
        <Sparkles size={26} color={colors.accent} />
        <T v="title" style={{ color: fg, textAlign: 'center', marginTop: 8 }}>
          {v.result.message}
        </T>
      </View>
    );
  }
  return (
    <View>
      <TextInput
        value={v.email}
        onChangeText={v.setEmail}
        placeholder="Your email"
        placeholderTextColor={dark ? 'rgba(245,230,211,0.45)' : colors.faint}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[st.input, dark && st.inputDark]}
      />
      <TextInput
        value={v.phone}
        onChangeText={v.setPhone}
        placeholder="WhatsApp number (optional)"
        placeholderTextColor={dark ? 'rgba(245,230,211,0.45)' : colors.faint}
        keyboardType="phone-pad"
        style={[st.input, dark && st.inputDark]}
      />
      {!!v.error && (
        <T v="caption" style={{ color: colors.danger, marginTop: 6 }}>
          {v.error}
        </T>
      )}
      <Button title="Join the VIP list" kind="accent" onPress={() => v.join(source)} loading={v.busy} style={{ marginTop: 12 }} />
    </View>
  );
}

/** First-launch welcome — once per install, a few seconds after the app opens, skipped for signed-in VIPs. */
export function WelcomeVip() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    AsyncStorage.multiGet(['vchuki_welcome_seen', 'vchuki_vip_joined'])
      .then(([[, seen], [, joined]]) => {
        if (!seen && !joined) t = setTimeout(() => setOpen(true), 6000);
      })
      .catch(() => {});
    return () => clearTimeout(t);
  }, []);
  const close = () => {
    setOpen(false);
    AsyncStorage.setItem('vchuki_welcome_seen', '1').catch(() => {});
  };
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <Pressable style={st.scrim} onPress={close} />
      <View style={st.center} pointerEvents="box-none">
        <View style={st.card}>
          <View style={st.crown}>
            <Crown size={24} color={colors.night} />
          </View>
          <T v="eyebrow" style={{ color: colors.accent, marginTop: 14 }}>
            Welcome to VCHUKI
          </T>
          <T style={{ fontFamily: fonts.display, fontSize: 26, color: colors.nightText, textAlign: 'center', marginTop: 6 }}>First look at every drop</T>
          <T v="small" style={{ color: 'rgba(245,230,211,0.7)', textAlign: 'center', marginTop: 6, marginBottom: 18 }}>
            Join the VIP list — the first 100 get 10% off and free shipping.
          </T>
          <VipForm source="app-welcome" dark />
          <Pressable onPress={close} style={{ alignSelf: 'center', marginTop: 14 }} hitSlop={10}>
            <T v="caption" style={{ color: 'rgba(245,230,211,0.55)' }}>
              Maybe later
            </T>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  input: { height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 15, color: colors.ink, marginTop: 10 },
  inputDark: { backgroundColor: 'rgba(245,230,211,0.06)', borderColor: 'rgba(245,230,211,0.18)', color: colors.nightText },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10,7,4,0.6)' },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 22 },
  card: { backgroundColor: colors.night, borderRadius: 24, padding: 24, alignItems: 'stretch' },
  crown: { alignSelf: 'center', width: 54, height: 54, borderRadius: 27, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
