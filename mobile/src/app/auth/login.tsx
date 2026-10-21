import { router, useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ShoppingBag } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { AuthShell } from '@/components/AuthShell';
import { OtpInput } from '@/components/OtpInput';
import { Segments } from '@/components/admin';
import { Button, Field, T, Tap } from '@/components/ui';
import { afterAuth } from '@/lib/afterAuth';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { colors, fonts } from '@/theme';

const REASONS: Record<string, string> = {
  checkout: 'Sign in to check out — your bag is saved.',
  review: 'Sign in to share a review with photos.',
  orders: 'Sign in to see and track your orders.',
};

export default function Login() {
  const { reason, staff: staffParam } = useLocalSearchParams<{ reason?: string; staff?: string }>();
  const signIn = useAuth((s) => s.signIn);
  const [mode, setMode] = useState<'shopper' | 'staff'>(staffParam ? 'staff' : 'shopper');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const staff = mode === 'staff';

  function countdown() {
    setResendIn(30);
    const t = setInterval(() => setResendIn((s) => (s <= 1 ? (clearInterval(t), 0) : s - 1)), 1000);
  }

  async function submitPassword() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email');
    if (!password) return setError('Enter your password');
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ pendingToken: string; sent: boolean }>('/api/mobile/auth/login', { method: 'POST', body: { email: email.trim(), password }, auth: false });
      setPending(r.pendingToken);
      setOtp('');
      countdown();
      if (!r.sent) setError('We couldn’t send the email just now. Tap “Resend code”.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp(code = otp) {
    if (code.length !== 4 || !pending) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ token: string; user: User }>('/api/mobile/auth/login/verify', { method: 'POST', body: { pendingToken: pending, otp: code }, auth: false });
      if (staff && r.user.role !== 'admin') {
        setPending(null);
        setError('This account doesn’t have Studio access. Ask the owner to make you an admin, or sign in as a shopper.');
        return;
      }
      await signIn(r.token, r.user);
      afterAuth(r.user, { reason, staff });
    } catch (e: any) {
      setError(e.message);
      setOtp('');
    } finally {
      setBusy(false);
    }
  }

  if (pending) {
    return (
      <AuthShell eyebrow="Step 2 of 2 · Verify" title="Check your inbox" subtitle={`We sent a 4-digit code to ${email.trim()}. It expires in 10 minutes.`} back={() => setPending(null)}>
        <OtpInput
          value={otp}
          error={!!error}
          onChange={(v) => {
            setOtp(v);
            setError(null);
            if (v.length === 4) submitOtp(v);
          }}
        />
        {!!error && (
          <T v="small" style={{ color: colors.danger, textAlign: 'center', marginTop: 14 }}>
            {error}
          </T>
        )}
        <Button title={staff ? 'Verify & open Studio' : 'Verify & sign in'} onPress={() => submitOtp()} loading={busy} disabled={otp.length !== 4} style={{ marginTop: 28 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 22, marginTop: 18 }}>
          <Tap onPress={submitPassword} disabled={resendIn > 0} hitSlop={8}>
            <T v="caption" style={{ color: resendIn ? colors.faint : colors.ink, fontFamily: fonts.semibold }}>
              {resendIn ? `Resend in ${resendIn}s` : 'Resend code'}
            </T>
          </Tap>
          <Tap onPress={() => setPending(null)} hitSlop={8}>
            <T v="caption" style={{ color: colors.muted }}>
              Use a different email
            </T>
          </Tap>
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow={staff ? 'VCHUKI Studio' : 'Welcome back'}
      title={staff ? 'Staff sign in' : 'Sign in'}
      subtitle={staff ? 'For the VCHUKI team — manage orders, stock and the shop counter.' : REASONS[reason || ''] || 'Track orders, save addresses and keep your wishlist on every device.'}>
      <View style={{ marginHorizontal: -20, marginTop: -14, marginBottom: 6 }}>
        <Segments
          items={[
            { key: 'shopper', label: 'Shopper' },
            { key: 'staff', label: 'Staff / Admin' },
          ]}
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError(null);
          }}
        />
      </View>
      <Field
        label="Email"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          setError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        right={<Mail size={17} color={colors.faint} />}
      />
      <Field
        label="Password"
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          setError(null);
        }}
        secureTextEntry={!show}
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={submitPassword}
        right={
          <Tap onPress={() => setShow((s) => !s)} hitSlop={10} accessibilityLabel={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff size={18} color={colors.muted} /> : <Eye size={18} color={colors.muted} />}
          </Tap>
        }
      />
      <Tap onPress={() => router.push({ pathname: '/auth/forgot', params: { email: email.trim() } })} style={{ alignSelf: 'flex-end', marginTop: -4 }} hitSlop={8}>
        <T v="caption" style={{ color: colors.accentDeep, fontFamily: fonts.semibold }}>
          Forgot password?
        </T>
      </Tap>
      {!!error && (
        <View style={{ backgroundColor: colors.dangerWash, borderRadius: 10, padding: 12, marginTop: 14 }}>
          <T v="small" style={{ color: colors.danger }}>
            {error}
          </T>
        </View>
      )}
      <Button
        title={staff ? 'Continue to Studio' : 'Continue'}
        onPress={submitPassword}
        loading={busy}
        icon={staff ? <ShieldCheck size={17} color={colors.nightText} /> : <Lock size={16} color={colors.nightText} />}
        style={{ marginTop: 22 }}
      />
      <T v="caption" style={{ textAlign: 'center', marginTop: 12 }}>
        We’ll email a one-time code to confirm it’s you.
      </T>
      {!staff && (
        <View style={{ marginTop: 26, alignItems: 'center', gap: 8 }}>
          <T v="small">New to VCHUKI?</T>
          <Button
            title="Create an account"
            kind="outline"
            icon={<ShoppingBag size={16} color={colors.ink} />}
            onPress={() => router.replace({ pathname: '/auth/register', params: { reason } })}
            style={{ alignSelf: 'stretch' }}
          />
        </View>
      )}
    </AuthShell>
  );
}
