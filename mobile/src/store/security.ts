import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

/**
 * App lock: a 4-digit MPIN plus optional fingerprint / Face ID.
 * The MPIN never leaves the phone — only a salted SHA-256 hash is kept in the Keychain/Keystore.
 * It unlocks the signed-in session on this device; it is not a password for vchuki.com.
 */
const KEY = 'vchuki_lock_v1';
const MAX_TRIES = 5;

interface Stored {
  hash: string;
  salt: string;
  biometric: boolean;
  tries: number;
}

export type BioKind = 'fingerprint' | 'face' | 'iris' | null;

interface SecurityState {
  ready: boolean;
  hasPin: boolean;
  biometric: boolean;
  bioKind: BioKind;
  locked: boolean;
  /** Set when the person skipped the setup prompt this session, so we don't nag again. */
  setupDismissed: boolean;
  load: () => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<'ok' | 'wrong' | 'reset'>;
  setBiometric: (on: boolean) => Promise<boolean>;
  unlockWithBiometric: (reason?: string) => Promise<boolean>;
  lock: () => void;
  unlock: () => void;
  clear: () => Promise<void>;
  dismissSetup: () => void;
}

async function read(): Promise<Stored | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}
async function write(s: Stored | null) {
  if (!s) await SecureStore.deleteItemAsync(KEY).catch(() => {});
  else await SecureStore.setItemAsync(KEY, JSON.stringify(s)).catch(() => {});
}
const hashPin = (pin: string, salt: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}:vchuki`);

async function detectBio(): Promise<BioKind> {
  try {
    if (!(await LocalAuthentication.hasHardwareAsync()) || !(await LocalAuthentication.isEnrolledAsync())) return null;
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'face';
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint';
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'iris';
  } catch {
    /* no hardware */
  }
  return null;
}

export const bioLabel = (k: BioKind) => (k === 'face' ? 'Face ID' : k === 'iris' ? 'Iris' : 'Fingerprint');

export const useSecurity = create<SecurityState>((set, get) => ({
  ready: false,
  hasPin: false,
  biometric: false,
  bioKind: null,
  locked: false,
  setupDismissed: false,

  load: async () => {
    const [s, bioKind] = await Promise.all([read(), detectBio()]);
    // Locked on every cold start when a PIN exists
    set({ ready: true, hasPin: !!s, biometric: !!s?.biometric && !!bioKind, bioKind, locked: !!s });
  },

  setPin: async (pin) => {
    const salt = Crypto.randomUUID();
    const prev = await read();
    await write({ hash: await hashPin(pin, salt), salt, biometric: prev?.biometric ?? false, tries: 0 });
    markStudioVerified();
    set({ hasPin: true, locked: false });
  },

  verifyPin: async (pin) => {
    const s = await read();
    if (!s) return 'ok';
    if ((await hashPin(pin, s.salt)) === s.hash) {
      await write({ ...s, tries: 0 });
      markStudioVerified();
      set({ locked: false });
      return 'ok';
    }
    const tries = s.tries + 1;
    if (tries >= MAX_TRIES) {
      await write(null);
      set({ hasPin: false, biometric: false, locked: false });
      return 'reset';
    }
    await write({ ...s, tries });
    return 'wrong';
  },

  setBiometric: async (on) => {
    const s = await read();
    if (!s) return false;
    if (on) {
      const r = await LocalAuthentication.authenticateAsync({ promptMessage: 'Turn on quick unlock', cancelLabel: 'Cancel', disableDeviceFallback: true });
      if (!r.success) return false;
    }
    await write({ ...s, biometric: on });
    set({ biometric: on });
    return true;
  },

  unlockWithBiometric: async (reason = 'Unlock VCHUKI') => {
    if (!get().biometric) return false;
    try {
      const r = await LocalAuthentication.authenticateAsync({ promptMessage: reason, cancelLabel: 'Use MPIN', disableDeviceFallback: true });
      if (r.success) {
        const s = await read();
        if (s) await write({ ...s, tries: 0 });
        markStudioVerified();
        set({ locked: false });
        return true;
      }
    } catch {
      /* fall back to MPIN */
    }
    return false;
  },

  lock: () => {
    if (get().hasPin) set({ locked: true });
  },
  unlock: () => set({ locked: false }),

  clear: async () => {
    await write(null);
    set({ hasPin: false, biometric: false, locked: false, setupDismissed: false });
  },

  dismissSetup: () => set({ setupDismissed: true }),
}));

/** Studio asks again if it hasn't been unlocked in the last 5 minutes. */
const STUDIO_WINDOW = 5 * 60 * 1000;
let studioVerifiedAt = 0;
export const studioNeedsUnlock = () => useSecurity.getState().hasPin && Date.now() - studioVerifiedAt > STUDIO_WINDOW;
export const markStudioVerified = () => {
  studioVerifiedAt = Date.now();
};
