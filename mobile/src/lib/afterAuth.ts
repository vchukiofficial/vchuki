import { router } from 'expo-router';
import type { User } from './types';
import { useSecurity } from '@/store/security';

/**
 * Where to go after a successful sign-in / sign-up.
 * Admins (and staff who chose "Staff") land in Studio; checkout resumes checkout.
 * Anyone without an MPIN yet is walked through MPIN + fingerprint first (required for admins).
 */
export function afterAuth(user: User, opts: { reason?: string; staff?: boolean } = {}) {
  const dest = user.role === 'admin' && opts.staff ? '/admin' : opts.reason === 'checkout' ? '/checkout' : null;
  const sec = useSecurity.getState();
  if (!sec.hasPin && (user.role === 'admin' || !sec.setupDismissed)) {
    router.replace({ pathname: '/security', params: { setup: '1', ...(dest ? { next: dest } : {}) } });
    return;
  }
  if (dest) router.replace(dest as any);
  else if (router.canDismiss()) router.dismissAll();
  else router.replace('/(tabs)/account');
}
