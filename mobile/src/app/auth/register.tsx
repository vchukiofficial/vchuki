import { router, useLocalSearchParams } from 'expo-router';
import { Check, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { AuthShell, StrengthMeter } from '@/components/AuthShell';
import { OtpInput } from '@/components/OtpInput';
import { Button, Field, T, Tap } from '@/components/ui';
import { afterAuth } from '@/lib/afterAuth';
import { api, webUrl } from '@/lib/api';
import type { User } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { colors, fonts } from '@/theme';
import * as WebBrowser from 'expo-web-browser';

export default function Register() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const signIn = useAuth((s) => s.signIn);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  const cleanEmail = email.trim().toLowerCase();

  async function sendCode() {
    if (name.trim().length < 2) return setError('Enter your name');
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return setError('Enter a valid email');
    if (password.length < 6) return setError('Password needs at least 6 characters');
    setBusy(true);
    setError(null);
    try {
      await api('/api/auth/send-otp', { method: 'POST', body: { email: cleanEmail, type: 'register' }, auth: false });
      setStep('code');
      setOtp('');
      setResendIn(30);
      const t = setInterval(() => setResendIn((s) => (s <= 1 ? (clearInterval(t), 0) : s - 1)), 1000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function create(code = otp) {
    if (code.length !== 4) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ token: string; user: User }>('/api/mobile/auth/register', {
        method: 'POST',
        body: { name: name.trim(), email: cleanEmail, password, otp: code },
        auth: false,
      });
      await signIn(r.token, r.user);
      afterAuth(r.user, { reason });
    } catch (e: any) {
      setError(e.message);
      setOtp('');
    } finally {
      setBusy(false);
    }
  }

  if (step === 'code') {
    return (
      <AuthShell eyebrow="Step 2 of 2 · Verify email" title="Enter your code" subtitle={`We sent a 4-digit code to ${cleanEmail}.`} back={() => setStep('details')}>
        <OtpInput
          value={otp}
          error={!!error}
          onChange={(v) => {
            setOtp(v);
            setError(null);
            if (v.length === 4) create(v);
          }}
        />
        {!!error && (
          <T v="small" style={{ color: colors.danger, textAlign: 'center', marginTop: 14 }}>
            {error}
          </T>
        )}
        <Button title="Create my account" onPress={() => create()} loading={busy} disabled={otp.length !== 4} style={{ marginTop: 28 }} />
        <Tap onPress={sendCode} disabled={resendIn > 0} style={{ alignSelf: 'center', marginTop: 18 }} hitSlop={8}>
          <T v="caption" style={{ color: resendIn ? colors.faint : colors.ink, fontFamily: fonts.semibold }}>
            {resendIn ? `Resend in ${resendIn}s` : 'Resend code'}
          </T>
        </Tap>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Step 1 of 2 · Join VCHUKI" title="Create your account" subtitle="Faster checkout, order tracking and first look at new drops.">
      <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!show}
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={sendCode}
        right={
          <Tap onPress={() => setShow((s) => !s)} hitSlop={10} accessibilityLabel={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff size={18} color={colors.muted} /> : <Eye size={18} color={colors.muted} />}
          </Tap>
        }
      />
      <StrengthMeter password={password} />
      {['Order tracking & easy returns', 'Wishlist on every device', 'Quick unlock with fingerprint / MPIN'].map((p) => (
        <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Check size={14} color={colors.success} />
          <T v="caption" style={{ color: colors.inkSoft }}>
            {p}
          </T>
        </View>
      ))}
      {!!error && (
        <View style={{ backgroundColor: colors.dangerWash, borderRadius: 10, padding: 12, marginTop: 10 }}>
          <T v="small" style={{ color: colors.danger }}>
            {error}
          </T>
        </View>
      )}
      <Button title="Send verification code" onPress={sendCode} loading={busy} style={{ marginTop: 20 }} />
      <T v="caption" style={{ textAlign: 'center', marginTop: 12 }}>
        By continuing you agree to our{' '}
        <T v="caption" style={{ textDecorationLine: 'underline', color: colors.ink }} onPress={() => WebBrowser.openBrowserAsync(webUrl('/terms-and-conditions'))}>
          Terms
        </T>{' '}
        and{' '}
        <T v="caption" style={{ textDecorationLine: 'underline', color: colors.ink }} onPress={() => WebBrowser.openBrowserAsync(webUrl('/privacy-policy'))}>
          Privacy Policy
        </T>
        .
      </T>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 22, gap: 6 }}>
        <T v="small">Already have an account?</T>
        <Tap onPress={() => router.replace({ pathname: '/auth/login', params: { reason } })} hitSlop={8}>
          <T v="small" style={{ color: colors.ink, fontFamily: fonts.semibold, textDecorationLine: 'underline' }}>
            Sign in
          </T>
        </Tap>
      </View>
    </AuthShell>
  );
}
