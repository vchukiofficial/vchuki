import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/store/auth';
import { bioLabel, useSecurity } from '@/store/security';
import { colors, fonts } from '@/theme';
import { PinPad, type PinPadHandle } from './PinPad';
import { T, Tap } from './ui';

/**
 * Full-screen unlock: tries fingerprint / Face ID straight away, MPIN as fallback.
 * Used for the app lock (root) and for re-entering VCHUKI Studio.
 */
export function LockScreen({ visible, title, subtitle, onUnlocked, onCancel }: { visible: boolean; title?: string; subtitle?: string; onUnlocked: () => void; onCancel?: () => void }) {
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const { biometric, bioKind, verifyPin, unlockWithBiometric, clear } = useSecurity();
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const pad = useRef<PinPadHandle>(null);

  async function tryBio() {
    if (await unlockWithBiometric(title || 'Unlock VCHUKI')) {
      setPin('');
      onUnlocked();
    }
  }

  useEffect(() => {
    if (visible) {
      setPin('');
      setMsg(null);
      if (biometric) setTimeout(tryBio, 350);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  async function onChange(v: string) {
    setPin(v);
    setMsg(null);
    if (v.length < 4) return;
    const r = await verifyPin(v);
    if (r === 'ok') {
      setPin('');
      onUnlocked();
    } else if (r === 'reset') {
      await signOut();
      Alert.alert('Signed out for safety', 'Too many wrong MPIN attempts. Please sign in again.');
      router.replace('/auth/login');
      onUnlocked();
    } else {
      pad.current?.shake();
      setPin('');
      setMsg('Wrong MPIN. Try again.');
    }
  }

  async function forgot() {
    Alert.alert('Forgot MPIN?', 'Sign in again with your email and password, then set a new MPIN.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign in again',
        onPress: async () => {
          await clear();
          await signOut();
          onUnlocked();
          router.replace('/auth/login');
        },
      },
    ]);
  }

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={() => onCancel?.()} statusBarTranslucent>
      <View style={[st.wrap, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
        <Image source={require('@/assets/images/logo-mark-light.png')} style={{ width: 54, height: 52 }} contentFit="contain" />
        <T style={st.title}>{title || `Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}</T>
        <T v="small" style={{ color: 'rgba(245,230,211,0.6)', marginTop: 6, marginBottom: 40, textAlign: 'center' }}>
          {msg || subtitle || (biometric ? `Use ${bioLabel(bioKind)} or your 4-digit MPIN` : 'Enter your 4-digit MPIN')}
        </T>
        <PinPad ref={pad} value={pin} onChange={onChange} bioKind={biometric ? bioKind : null} onBio={tryBio} />
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', gap: 28 }}>
          <Tap onPress={forgot} hitSlop={10}>
            <T v="caption" style={{ color: colors.accent, fontFamily: fonts.semibold }}>
              Forgot MPIN?
            </T>
          </Tap>
          {onCancel && (
            <Tap onPress={onCancel} hitSlop={10}>
              <T v="caption" style={{ color: 'rgba(245,230,211,0.6)', fontFamily: fonts.semibold }}>
                Cancel
              </T>
            </Tap>
          )}
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', paddingHorizontal: 24 },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.nightText, marginTop: 22, textAlign: 'center' },
});
