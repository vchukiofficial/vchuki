import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import { toast } from '@/components/Toast';

/**
 * Android system back on a screen that may have been opened directly from a link or a
 * notification (no history): go to Home instead of closing the app.
 * Pass a custom handler to override (e.g. order success → My orders).
 */
export function useBackToHome(custom?: () => void) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (custom) {
          custom();
          return true;
        }
        if (router.canGoBack()) return false;
        router.replace('/(tabs)');
        return true;
      });
      return () => sub.remove();
    }, [custom]),
  );
}

/** On the Home tab: first back press shows a hint, second within 2s exits. */
export function useDoubleBackToExit() {
  const last = useRef(0);
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (router.canGoBack()) return false;
        const now = Date.now();
        if (now - last.current < 2000) {
          BackHandler.exitApp();
          return true;
        }
        last.current = now;
        toast('Press back again to exit');
        return true;
      });
      return () => sub.remove();
    }, []),
  );
}
