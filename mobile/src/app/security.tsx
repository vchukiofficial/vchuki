import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Fingerprint, KeyRound, ScanFace, ShieldCheck } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PinPad, type PinPadHandle } from '@/components/PinPad';
import { toast } from '@/components/Toast';
import { Button, Card, Header, T, Tap } from '@/components/ui';
import { ToggleRow } from '@/components/admin';
import { useAuth } from '@/store/auth';
import { bioLabel, useSecurity } from '@/store/security';
import { colors, fonts, GUTTER } from '@/theme';

type Step = 'create' | 'confirm' | 'bio' | 'manage' | 'verify-old';

/**
 * MPIN + fingerprint/Face ID.
 *  /security?setup=1&next=/admin   → onboarding after sign-in
 *  /security                         → manage (Account → Security)
 */
export default function Security() {
  const { setup, next } = useLocalSearchParams<{ setup?: string; next?: string }>();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const { hasPin, biometric, bioKind, setPin, verifyPin, setBiometric, clear, dismissSetup } = useSecurity();
  const isAdmin = user?.role === 'admin';
  const [step, setStep] = useState<Step>(hasPin && !setup ? 'manage' : 'create');
  const [first, setFirst] = useState('');
  const [value, setValue] = useState('');
  const pad = useRef<PinPadHandle>(null);
  const BioIcon = bioKind === 'face' ? ScanFace : Fingerprint;

  function finish() {
    if (next) router.replace(next as any);
    else if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/account');
  }

  async function onPin(v: string) {
    setValue(v);
    if (v.length < 4) return;
    if (step === 'verify-old') {
      const r = await verifyPin(v);
      setValue('');
      if (r === 'ok') setStep('create');
      else if (r === 'reset') finish();
      else pad.current?.shake();
      return;
    }
    if (step === 'create') {
      if (/^(\d)\1{3}$/.test(v) || '0123456789'.includes(v) || '9876543210'.includes(v)) {
        pad.current?.shake();
        setValue('');
        Alert.alert('Too easy to guess', 'Avoid 1111, 1234 and similar.');
        return;
      }
      setFirst(v);
      setValue('');
      setStep('confirm');
      return;
    }
    if (step === 'confirm') {
      if (v !== first) {
        pad.current?.shake();
        setValue('');
        setFirst('');
        setStep('create');
        Alert.alert('MPINs didn’t match', 'Please set it again.');
        return;
      }
      await setPin(v);
      setValue('');
      if (bioKind && !biometric) setStep('bio');
      else {
        toast('MPIN saved');
        hasPin && !setup ? setStep('manage') : finish();
      }
    }
  }

  // ── Manage screen ───────────────────────────────────────────────
  if (step === 'manage') {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Security" />
        <ScrollView contentContainerStyle={{ padding: GUTTER }}>
          <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <ShieldCheck size={26} color={colors.success} />
            <View style={{ flex: 1 }}>
              <T v="title">App lock is on</T>
              <T v="caption">VCHUKI asks for your MPIN{biometric ? ` or ${bioLabel(bioKind)}` : ''} when it opens and after a minute in the background.</T>
            </View>
          </Card>
          <Card style={{ marginTop: 14, paddingVertical: 2 }}>
            {bioKind ? (
              <ToggleRow
                label={`Unlock with ${bioLabel(bioKind)}`}
                hint="Faster than typing your MPIN"
                value={biometric}
                onChange={async (on) => {
                  const ok = await setBiometric(on);
                  if (!ok && on) toast(`${bioLabel(bioKind)} not confirmed`);
                }}
              />
            ) : (
              <T v="caption" style={{ paddingVertical: 12 }}>
                No fingerprint or Face ID is set up on this phone.
              </T>
            )}
          </Card>
          <Button title="Change MPIN" kind="outline" icon={<KeyRound size={16} color={colors.ink} />} onPress={() => setStep('verify-old')} style={{ marginTop: 18 }} />
          {!isAdmin && (
            <Button
              title="Turn off app lock"
              kind="ghost"
              compact
              onPress={() =>
                Alert.alert('Turn off app lock?', 'Anyone with your phone could open your account and orders.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Turn off',
                    style: 'destructive',
                    onPress: async () => {
                      await clear();
                      router.back();
                    },
                  },
                ])
              }
              style={{ marginTop: 8 }}
            />
          )}
          {isAdmin && (
            <T v="caption" style={{ textAlign: 'center', marginTop: 14 }}>
              App lock stays on for admin accounts — Studio controls the whole store.
            </T>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── Biometric offer ─────────────────────────────────────────────
  if (step === 'bio') {
    return (
      <View style={[st.dark, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }]}>
        <View style={st.bioCircle}>
          <BioIcon size={56} color={colors.accent} strokeWidth={1.2} />
        </View>
        <T style={st.h}>Use {bioLabel(bioKind)}?</T>
        <T v="body" style={st.sub}>
          Open VCHUKI{isAdmin ? ' and Studio' : ''} with a touch instead of typing your MPIN every time.
        </T>
        <View style={{ flex: 1 }} />
        <Button
          title={`Turn on ${bioLabel(bioKind)}`}
          kind="accent"
          onPress={async () => {
            const ok = await setBiometric(true);
            toast(ok ? `${bioLabel(bioKind)} is on` : 'You can turn it on later in Security');
            finish();
          }}
          style={{ alignSelf: 'stretch' }}
        />
        <Tap onPress={finish} style={{ marginTop: 16 }} hitSlop={10}>
          <T v="caption" style={{ color: 'rgba(245,230,211,0.6)', fontFamily: fonts.semibold }}>
            Not now
          </T>
        </Tap>
      </View>
    );
  }

  // ── Create / confirm / verify ───────────────────────────────────
  const heading = step === 'verify-old' ? 'Enter current MPIN' : step === 'confirm' ? 'Confirm your MPIN' : 'Create your MPIN';
  const sub =
    step === 'verify-old'
      ? 'Then choose a new one.'
      : step === 'confirm'
        ? 'Enter the same 4 digits again.'
        : isAdmin
          ? 'Required for admin accounts. You’ll use it to open the app and VCHUKI Studio.'
          : 'A 4-digit code to open VCHUKI quickly and keep your orders private.';

  return (
    <View style={[st.dark, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 20 }]}>
      <Image source={require('@/assets/images/logo-mark-light.png')} style={{ width: 46, height: 45 }} contentFit="contain" />
      <View style={st.steps}>
        {['create', 'confirm', 'bio'].map((s, i) => (
          <View key={s} style={[st.stepBar, ['create', 'confirm', 'bio'].indexOf(step) >= i && { backgroundColor: colors.accent }]} />
        ))}
      </View>
      <T style={st.h}>{heading}</T>
      <T v="body" style={[st.sub, { marginBottom: 38 }]}>
        {sub}
      </T>
      <PinPad ref={pad} value={value} onChange={onPin} />
      <View style={{ flex: 1 }} />
      {!isAdmin && setup && step === 'create' && (
        <Tap
          onPress={() => {
            dismissSetup();
            finish();
          }}
          hitSlop={10}>
          <T v="caption" style={{ color: 'rgba(245,230,211,0.6)', fontFamily: fonts.semibold }}>
            Skip for now
          </T>
        </Tap>
      )}
      {!setup && (
        <Tap onPress={() => (hasPin ? setStep('manage') : router.back())} hitSlop={10}>
          <T v="caption" style={{ color: 'rgba(245,230,211,0.6)', fontFamily: fonts.semibold }}>
            Cancel
          </T>
        </Tap>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  dark: { flex: 1, backgroundColor: colors.night, alignItems: 'center', paddingHorizontal: 28 },
  steps: { flexDirection: 'row', gap: 6, marginTop: 22 },
  stepBar: { width: 26, height: 3, borderRadius: 2, backgroundColor: 'rgba(245,230,211,0.15)' },
  h: { fontFamily: fonts.display, fontSize: 28, color: colors.nightText, marginTop: 18, textAlign: 'center' },
  sub: { color: 'rgba(245,230,211,0.65)', textAlign: 'center', marginTop: 8 },
  bioCircle: { width: 128, height: 128, borderRadius: 64, borderWidth: 1, borderColor: 'rgba(196,149,106,0.4)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(196,149,106,0.08)' },
});
