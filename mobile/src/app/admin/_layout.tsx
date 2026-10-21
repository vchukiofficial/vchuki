import { Redirect, router, Stack } from 'expo-router';
import { useState } from 'react';
import { LockScreen } from '@/components/LockScreen';
import { useAuth } from '@/store/auth';
import { markStudioVerified, studioNeedsUnlock, useSecurity } from '@/store/security';
import { colors } from '@/theme';

/**
 * Every /admin screen is for role "admin" only (the API enforces this too).
 * Admins must have an MPIN, and Studio asks for fingerprint / MPIN again after 5 minutes away.
 */
export default function AdminLayout() {
  const user = useAuth((s) => s.user);
  const token = useAuth((s) => s.token);
  const hasPin = useSecurity((s) => s.hasPin);
  const [unlocked, setUnlocked] = useState(() => !studioNeedsUnlock());

  if (!token) return <Redirect href={{ pathname: '/auth/login', params: { staff: '1' } }} />;
  if (user && user.role !== 'admin') return <Redirect href="/(tabs)/account" />;
  if (!hasPin) return <Redirect href={{ pathname: '/security', params: { setup: '1', next: '/admin' } }} />;

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }} />
      <LockScreen
        visible={!unlocked}
        title="Unlock VCHUKI Studio"
        onUnlocked={() => {
          markStudioVerified();
          setUnlocked(true);
        }}
        onCancel={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/account'))}
      />
    </>
  );
}
