import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { AuthShell, StrengthMeter } from '@/components/AuthShell';
import { OtpInput } from '@/components/OtpInput';
import { Button, Field, T, Tap } from '@/components/ui';
import { api } from '@/lib/api';
import { colors, fonts } from '@/theme';

/** Same three calls as vchuki.com/auth/forgot-password: send-otp → verify-otp → reset-password. */
export default function Forgot() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'done'>('email');
  const [email, setEmail] = useState(params.email || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const send = () =>
    run(async () => {
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) throw new Error('Enter a valid email');
      await api('/api/auth/send-otp', { method: 'POST', body: { email: email.trim(), type: 'reset' }, auth: false });
      setOtp('');
      setStep('code');
    });

  const verify = (code = otp) =>
    run(async () => {
      try {
        await api('/api/auth/verify-otp', { method: 'POST', body: { email: email.trim(), otp: code, type: 'reset' }, auth: false });
        setStep('password');
      } catch (e) {
        setOtp('');
        throw e;
      }
    });

  const reset = () =>
    run(async () => {
      if (password.length < 6) throw new Error('Password needs at least 6 characters');
      if (password !== confirm) throw new Error('Passwords don’t match');
      await api('/api/auth/reset-password', { method: 'POST', body: { email: email.trim(), password }, auth: false });
      setStep('done');
    });

  const err = !!error && (
    <View style={{ backgroundColor: colors.dangerWash, borderRadius: 10, padding: 12, marginTop: 6, marginBottom: 6 }}>
      <T v="small" style={{ color: colors.danger }}>
        {error}
      </T>
    </View>
  );

  if (step === 'done') {
    return (
      <AuthShell eyebrow="All set" title="Password updated">
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <CheckCircle2 size={56} color={colors.success} strokeWidth={1.4} />
          <T v="body" style={{ textAlign: 'center', marginTop: 12 }}>
            Sign in with your new password. It works on vchuki.com too.
          </T>
        </View>
        <Button title="Back to sign in" onPress={() => router.replace('/auth/login')} />
      </AuthShell>
    );
  }

  if (step === 'password') {
    return (
      <AuthShell eyebrow="Step 3 of 3" title="Choose a new password" back={() => setStep('code')}>
        <Field
          label="New password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!show}
          autoComplete="new-password"
          textContentType="newPassword"
          right={
            <Tap onPress={() => setShow((s) => !s)} hitSlop={10}>
              {show ? <EyeOff size={18} color={colors.muted} /> : <Eye size={18} color={colors.muted} />}
            </Tap>
          }
        />
        <StrengthMeter password={password} />
        <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry={!show} onSubmitEditing={reset} />
        {err}
        <Button title="Update password" onPress={reset} loading={busy} style={{ marginTop: 10 }} />
      </AuthShell>
    );
  }

  if (step === 'code') {
    return (
      <AuthShell eyebrow="Step 2 of 3" title="Enter the code" subtitle={`We sent a 4-digit code to ${email.trim()}.`} back={() => setStep('email')}>
        <OtpInput
          value={otp}
          error={!!error}
          onChange={(v) => {
            setOtp(v);
            setError(null);
            if (v.length === 4) verify(v);
          }}
        />
        <View style={{ marginTop: 14 }}>{err}</View>
        <Button title="Verify" onPress={() => verify()} loading={busy} disabled={otp.length !== 4} style={{ marginTop: 14 }} />
        <Tap onPress={send} style={{ alignSelf: 'center', marginTop: 18 }} hitSlop={8}>
          <T v="caption" style={{ color: colors.ink, fontFamily: fonts.semibold }}>
            Resend code
          </T>
        </Tap>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Step 1 of 3 · Reset password" title="Forgot your password?" subtitle="Enter your account email and we’ll send you a code." back={() => router.back()}>
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" onSubmitEditing={send} />
      {err}
      <Button title="Send code" onPress={send} loading={busy} disabled={!email.trim()} style={{ marginTop: 6 }} />
    </AuthShell>
  );
}
